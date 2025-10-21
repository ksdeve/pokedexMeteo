import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import Pokemon, { type PokemonType } from './models/pokemon.js';
import type WeatherResponse from './models/weatherResponse.js';
import type WeatherEffect from './models/weatherEffect.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pokedex';
const WEATHER_SERVICE_URL = process.env.WEATHER_SERVICE_URL || 'http://localhost:4001';

// Connexion à MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('BDD Mongo connecté !'))
  .catch(console.error);


// Logique d’effets météo
function computeWeatherEffects(pokemon: PokemonType, weatherState: string): WeatherEffect {
  
  const type = (pokemon.types || []).map(type => type.toLowerCase()); // maper tous les types en lowerCase

  const effects: string[] = [];
  let attackBoost = 0;
  let defenseBoost = 0;

  switch (weatherState) {
    case 'rain': // Pluie
      if (type.includes('feu')) {
        effects.push('affaibli_par_la_pluie'); // les attaques feu sont moins puissantes
        attackBoost -= 0.5;
      }
      if (type.includes('eau')) {
        effects.push('renforcé_par_la_pluie');  // les attaques eau sont plus puissantes
        attackBoost += 0.5;
      }

      if (effects.length === 0) effects.push('normal');

      break;

    case 'clear': // Soleil
      if (type.includes('feu')) {
        effects.push('boost_soleil'); // les attaques feu sont renforcées
        attackBoost += 0.3;
      }
      if (type.includes('plante')) {
        effects.push('photosynthèse'); // les Pokémon plante récupèrent mieux
        defenseBoost += 0.3;
      }

      if (effects.length === 0) effects.push('normal');

      break;

    case 'snow': // Grêle
      effects.push('grêle'); // les pokémon Glace sont protégés
      if (type.includes('glace')) {
        defenseBoost += 0.3;
      }
      
      if (effects.length === 0) effects.push('normal');

      break;

    case 'thunder': // Foudre
      effects.push('orage');
      if (type.includes('électrik')) {
        attackBoost += 0.4; // les attaques électrique sont renforcées
      }
      
      if (effects.length === 0) effects.push('normal');

      break;

    default:
      effects.push('normal'); // pas d’effet météo
  }

  

  return { effects, attackBoost, defenseBoost };
}

// Routes


// Liste de tous les pokemons
app.get('/pokemon', async (_req: Request, res: Response) => {
  const pokemons = await Pokemon.find().lean<PokemonType[]>(); // récupère données brutes
  res.json(pokemons);
});


// GET le pokemon en fonction de la météo de la ville saisie
app.get('/pokemon/:city/:uid', async (req: Request, res: Response) => {
 
  const { city, uid } = req.params;

  const pkm = await Pokemon.findOne({ uid }).lean<PokemonType>();
  if (!pkm) {
    return res.status(404).json(
      { 
        error: 'pokemon_not_found' 
      }
    );
  }

  try {
    if (!city) {
      return res.status(400).json(
        { 
          error: 'city_required' 
        }
      );
    }

    const weatherResp = await fetch(`${WEATHER_SERVICE_URL}/weather?city=${encodeURIComponent(city)}`);
    const weather: WeatherResponse = await weatherResp.json();

    const { effects, attackBoost, defenseBoost } = computeWeatherEffects(pkm, weather.state);

    const modifiedStats = {
      ...pkm.stats,
      attack: Math.round(pkm.stats.attack * (1 + attackBoost)),
      defense: Math.round(pkm.stats.defense * (1 + defenseBoost)),
    };

    res.json({
      city,
      pokemon: { ...pkm, stats: modifiedStats },
      weather,
      effects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'weather_service_unavailable' });
  }
});

app.listen(PORT, () => console.log(`Serveur pokedex fonctionnant sur le port ${PORT}`));
