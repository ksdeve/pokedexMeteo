// jest.config.cjs
module.exports = {
  preset: 'ts-jest',        // pour gérer TypeScript
  testEnvironment: 'node',  // environnement Node.js pour les tests
  testPathIgnorePatterns: ['/dist/'], // ignore les fichiers compilés
};
