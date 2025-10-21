import mongoose, { Document, Model } from 'mongoose';

// --- Interfaces TS ---
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  special_attack: number;
  special_defense: number;
}

export interface PokemonType extends Document {
  uid: string;
  name: string;
  types: string[];
  stats: PokemonStats;
}

// --- Schéma Mongoose ---
const pokemonSchema = new mongoose.Schema<PokemonType>({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  types: [{ type: String, required: true }],
  stats: {
    hp: { type: Number, required: true },
    attack: { type: Number, required: true },
    defense: { type: Number, required: true },
    speed: { type: Number, required: true },
    special_attack: { type: Number, required: true },
    special_defense: { type: Number, required: true }
  }
});

// --- Export du modèle ---
const Pokemon: Model<PokemonType> = mongoose.model<PokemonType>('Pokemon', pokemonSchema);
export default Pokemon;
