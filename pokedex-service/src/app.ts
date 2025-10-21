// src/app.ts
import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import Pokemon from './models/pokemon.js';

import type { PokemonType } from './models/pokemon';
import type WeatherResponse from './models/weatherResponse.js';
import type WeatherEffect from './models/weatherEffect.js';

export const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pokedex';
const WEATHER_SERVICE_URL = process.env.WEATHER_SERVICE_URL || 'http://localhost:4001';

// Connexion à MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('BDD Mongo connecté !'))
  .catch(console.error);

// Logique d’effets météo
export function computeWeatherEffects(pokemon: PokemonType, weatherState: string): WeatherEffect {
  const type = (pokemon.types || []).map(type => type.toLowerCase());
  const effects: string[] = [];
  let attackBoost = 0;
  let defenseBoost = 0;

  switch (weatherState) {
    case 'rain':
      if (type.includes('feu')) { effects.push('affaibli_par_la_pluie'); attackBoost -= 0.5; }
      if (type.includes('eau')) { effects.push('renforcé_par_la_pluie'); attackBoost += 0.5; }
      if (!effects.length) effects.push('normal');
      break;
    case 'clear':
      if (type.includes('feu')) { effects.push('boost_soleil'); attackBoost += 0.3; }
      if (type.includes('plante')) { effects.push('photosynthèse'); defenseBoost += 0.3; }
      if (!effects.length) effects.push('normal');
      break;
    case 'snow':
      effects.push('grêle');
      if (type.includes('glace')) defenseBoost += 0.3;
      if (!effects.length) effects.push('normal');
      break;
    case 'thunder':
      effects.push('orage');
      if (type.includes('électrik')) attackBoost += 0.4;
      if (!effects.length) effects.push('normal');
      break;
    default:
      effects.push('normal');
  }

  return { effects, attackBoost, defenseBoost };
}

// Routes
app.get('/pokemon', async (_req: Request, res: Response) => {
  const pokemons = await Pokemon.find().lean<PokemonType[]>();
  res.json(pokemons);
});

app.get('/pokemon/:city/:uid', async (req: Request, res: Response) => {
  const { city, uid } = req.params;
  const pkm = await Pokemon.findOne({ uid }).lean<PokemonType>();
  if (!pkm) return res.status(404).json({ error: 'pokemon_not_found' });

  if (!city) return res.status(400).json({ error: 'city_required' });

  try {
    const weatherResp = await fetch(`${WEATHER_SERVICE_URL}/weather?city=${encodeURIComponent(city)}`);
    const weather: WeatherResponse = await weatherResp.json();

    const { effects, attackBoost, defenseBoost } = computeWeatherEffects(pkm, weather.state);
    const modifiedStats = {
      ...pkm.stats,
      attack: Math.round(pkm.stats.attack * (1 + attackBoost)),
      defense: Math.round(pkm.stats.defense * (1 + defenseBoost)),
    };

    res.json({ city, pokemon: { ...pkm, stats: modifiedStats }, weather, effects });
  } catch {
    res.status(500).json({ error: 'weather_service_unavailable' });
  }
});
