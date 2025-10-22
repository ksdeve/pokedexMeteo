# Étape 1 : build
FROM node:18-alpine AS build
WORKDIR /app


COPY package.json package-lock.json* ./

RUN npm install
COPY . .
RUN npm run build

# Étape 2 : run
FROM node:18-alpine
WORKDIR /app

COPY package.json ./ 
RUN npm install --only=prod

COPY --from=build /app/dist ./dist

EXPOSE 4000

# Exécuter seed.js puis index.js
CMD node dist/seed.js && node dist/server.js
