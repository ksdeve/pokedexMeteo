import express from 'express';
import type { Request, Response } from 'express';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import 'dotenv/config';
import type RedisOptions from './models/redisOptions.js';
import type GeoData from './models/geoCodingDTO.js';
import type WeatherPayload from './models/weatherPayload.js';
import type { WeatherState } from './models/weatherPayload.js';
import type WeatherData from './models/weatherData.js';
import client from 'prom-client';

const app = express();
const PORT: number = parseInt(process.env.PORT || '4001', 10);

// Redis configuration
const REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT: number = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD: string | undefined = process.env.REDIS_PASSWORD || undefined;
const CACHE_TTL_SECONDS: number = parseInt(process.env.CACHE_TTL_SECONDS || '600', 10);

// Registry par défaut
const register = new client.Registry();

client.collectDefaultMetrics({ register });

// Exemple compteur HTTP
const httpRequestCounter = new client.Counter({
  name: 'weather_http_requests_total',
  help: 'Nombre total de requêtes HTTP reçues par le service météo',
  labelNames: ['route', 'method'],
});

register.registerMetric(httpRequestCounter);

app.use((req, _res, next) => {
  httpRequestCounter.inc({ route: req.path, method: req.method });
  next();
});



const redisOptions: RedisOptions = { socket: { host: REDIS_HOST, port: REDIS_PORT } };
if (REDIS_PASSWORD) redisOptions.password = REDIS_PASSWORD;

const redisClient: RedisClientType = createClient(redisOptions);

redisClient.connect().catch(err => console.error('Redis connect error', err.message));
redisClient.on('error', err => console.error('Redis Client Error', err));
redisClient.on('ready', () => console.log('Redis ready'));

// Helpers
const keyFor = (city: string): string => `weather:${city.toLowerCase()}`;

function weatherCodeToState(code: number): WeatherState {
  if (code === 0) return 'clear';
  if ([1, 2, 3].includes(code)) return 'cloudy';
  if ([45, 48].includes(code)) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 95) return 'thunder';
  return 'unknown';
}

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Route principale : /weather?city=Paris
app.get('/weather', async (req: Request, res: Response) => {
  const city = req.query.city as string | undefined;
  if (!city) return res.status(400).json({ error: 'city is required' });

  const cacheKey = keyFor(city);

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ source: 'cache', ...(JSON.parse(cached) as WeatherPayload) });
    }
  } catch (err: any) {
    console.warn('Redis GET failed:', err.message);
  }

  try {
    const geoResp = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData: GeoData = await geoResp.json();

    if (!geoData.results || geoData.results.length === 0)
      return res.status(404).json({ error: 'city_not_found' });

    const { latitude, longitude } = geoData.results[0];

    const weatherResp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData: WeatherData = await weatherResp.json();

    const cw = weatherData.current_weather || {};
    const state = weatherCodeToState(cw.weathercode ?? -1);

    const payload: WeatherPayload = {
      city,
      temperature: cw.temperature,
      weathercode: cw.weathercode,
      state,
    };

    await redisClient.setEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(payload));
    res.json({ source: 'open-meteo', ...payload });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

app.listen(PORT, () => console.log(`Serveur weather fonctionnant sur le port ${PORT}`));
