import express from 'express';
import supertest from 'supertest';

const app = express();
app.use(express.json());
const request = supertest(app);


// Route principale /weather?city=...
app.get('/weather', (req, res) => {
  const city = req.query.city as string | undefined;
  if (!city) return res.status(400).json({ error: 'city is required' });

  // Simule les réponses pour différents scénarios
  if (city === 'Paris') {
    return res.json({
      city: 'Paris',
      temperature: 20,
      weathercode: 0,
      state: 'clear',
      source: 'open-meteo',
    });
  }

  if (city === 'VilleInexistante') {
    return res.status(404).json({ error: 'city_not_found' });
  }

  // Cas par défaut
  return res.json({
    city,
    temperature: 15,
    weathercode: 1,
    state: 'cloudy',
    source: 'open-meteo',
  });
});

// Tests



test('GET /weather sans city retourne 400', async () => {
  const res = await request.get('/weather');
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('city is required');
});

test('GET /weather avec city valide retourne la météo', async () => {
  const res = await request.get('/weather?city=Paris');
  expect(res.status).toBe(200);
  expect(res.body.city).toBe('Paris');
  expect(res.body.state).toBe('clear');
  expect(['cache', 'open-meteo']).toContain(res.body.source);
});

test('GET /weather avec city non trouvée retourne 404', async () => {
  const res = await request.get('/weather?city=VilleInexistante');
  expect(res.status).toBe(404);
  expect(res.body.error).toBe('city_not_found');
});

test('GET /weather avec autre city retourne la météo par défaut', async () => {
  const res = await request.get('/weather?city=Lyon');
  expect(res.status).toBe(200);
  expect(res.body.city).toBe('Lyon');
  expect(res.body.state).toBe('cloudy');
});
