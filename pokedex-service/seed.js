import mongoose from 'mongoose';
import Pokemon from './dist/models/pokemon.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pokedex';

const samplePokemons = [
  { uid: 'p001', name: 'Salamèche', types: ['Feu'], stats: { hp: 39, attack: 52, defense: 43, speed: 65, special_attack: 60, special_defense: 50 } },
  { uid: 'p002', name: 'Carapuce', types: ['Eau'], stats: { hp: 44, attack: 48, defense: 65, speed: 43, special_attack: 50, special_defense: 64 } },
  { uid: 'p003', name: 'Bulbizarre', types: ['Plante', 'Poison'], stats: { hp: 45, attack: 49, defense: 49, speed: 45, special_attack: 65, special_defense: 65 } },
  { uid: 'p004', name: 'Pikachu', types: ['Électrik'], stats: { hp: 35, attack: 55, defense: 40, speed: 90, special_attack: 50, special_defense: 50 } },
  { uid: 'p005', name: 'Goupix', types: ['Feu'], stats: { hp: 38, attack: 41, defense: 40, speed: 65, special_attack: 50, special_defense: 65 } },
  { uid: 'p006', name: 'Lokhlass', types: ['Eau', 'Glace'], stats: { hp: 130, attack: 85, defense: 80, speed: 60, special_attack: 85, special_defense: 95 } },
  { uid: 'p007', name: 'Électhor', types: ['Électrik'], stats: { hp: 65, attack: 65, defense: 60, speed: 130, special_attack: 110, special_defense: 95 } },
  { uid: 'p008', name: 'Ronflex', types: ['Normal'], stats: { hp: 160, attack: 110, defense: 65, speed: 30, special_attack: 65, special_defense: 110 } },
  { uid: 'p009', name: 'Artikodin', types: ['Glace', 'Vol'], stats: { hp: 90, attack: 85, defense: 100, speed: 85, special_attack: 95, special_defense: 125 } },
  { uid: 'p010', name: 'Électhor', types: ['Électrik', 'Vol'], stats: { hp: 90, attack: 90, defense: 85, speed: 100, special_attack: 125, special_defense: 90 } },
  { uid: 'p011', name: 'Sulfura', types: ['Feu', 'Vol'], stats: { hp: 90, attack: 100, defense: 90, speed: 90, special_attack: 125, special_defense: 85 } },
  { uid: 'p012', name: 'Dracolosse', types: ['Dragon', 'Vol'], stats: { hp: 91, attack: 134, defense: 95, speed: 80, special_attack: 100, special_defense: 100 } },
  { uid: 'p013', name: 'Mewtwo', types: ['Psy'], stats: { hp: 106, attack: 110, defense: 90, speed: 130, special_attack: 154, special_defense: 90 } },
  { uid: 'p014', name: 'Évoli', types: ['Normal'], stats: { hp: 55, attack: 55, defense: 50, speed: 55, special_attack: 45, special_defense: 65 } }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Mongo connecté');
    await Pokemon.deleteMany({});
    await Pokemon.insertMany(samplePokemons);
    console.log('Seed terminé');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
