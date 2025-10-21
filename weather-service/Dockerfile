# Étape 1 : build
FROM node:18-alpine AS build
WORKDIR /app

# Copier les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json* ./

# Installer toutes les dépendances (y compris dev, car on build)
RUN npm install

# Copier tout le code source
COPY . .

# Compiler le TypeScript en JavaScript
RUN npm run build

# Étape 2 : run (plus léger)
FROM node:18-alpine
WORKDIR /app

# Copier uniquement les fichiers nécessaires à l’exécution
COPY package.json ./
RUN npm install

# Copier le code compilé depuis l’étape build
COPY --from=build /app/dist ./dist

EXPOSE 4001

# Lancer l’app
CMD ["node", "dist/index.js"]
