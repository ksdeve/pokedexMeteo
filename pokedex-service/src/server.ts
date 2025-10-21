// src/server.ts
import { app } from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Serveur pokedex fonctionnant sur le port ${PORT}`);
});
