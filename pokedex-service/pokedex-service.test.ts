import request from 'supertest';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

describe('Pokedex Service Integration Tests via URL', () => {

  it('GET /pokemon should return array of pokemons', async () => {
    const res = await request(BASE_URL).get('/pokemon');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /pokemon/:city/:uid should return pokemon with modified stats', async () => {
    const res = await request(BASE_URL).get('/pokemon/london/p001');

    expect(res.status).toBe(200);
    expect(res.body.pokemon).toHaveProperty('name');
    expect(res.body.weather).toHaveProperty('state');
    expect(res.body.effects).toBeInstanceOf(Array);
    expect(res.body.pokemon.stats.attack).toBeGreaterThan(0);
    expect(res.body.pokemon.stats.defense).toBeGreaterThan(0);
  });
});
