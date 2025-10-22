# PokedexMeteo

Un projet Node.js/TypeScript utilisant Docker qui combine :

- Un **service Pokémon** (`pokedex-service`) qui fournit les stats des Pokémon et applique des effets météo.
- Un **service météo** (`weather-service`) qui fournit l’état météo d’une ville et utilise **Redis** pour le cache.
- MongoDB pour stocker les données Pokémon.
- **Prometheus** pour la collecte des métriques.
- **Grafana** pour le monitoring et la visualisation des métriques via dashboards.

---

## Table des matières

- [PokedexMeteo](#pokedexmeteo)
  - [Table des matières](#table-des-matières)
  - [Technologies](#technologies)
  - [Prérequis](#prérequis)
  - [Installation et lancement](#installation-et-lancement)
    - [1. Cloner le projet](#1-cloner-le-projet)
    - [2. Lancer les services en développement](#2-lancer-les-services-en-développement)
    - [3. Lancer les services en production](#3-lancer-les-services-en-production)
    - [4. Ports utilisés (dev)](#4-ports-utilisés-dev)
    - [5. Arrêter les services](#5-arrêter-les-services)
  - [Structure du projet](#structure-du-projet)
  - [Services et endpoints](#services-et-endpoints)
    - [pokedex-service (`index.ts`)](#pokedex-service-indexts)
    - [weather-service (`index.ts`)](#weather-service-indexts)
  - [Seed de la base de données](#seed-de-la-base-de-données)
  - [Redis et cache](#redis-et-cache)
  - [Monitoring](#monitoring)
  - [Fichier `.env`](#fichier-env)
  - [Notes](#notes)

---

## Technologies

- Node.js 18 & TypeScript
- Express.js
- MongoDB & Mongoose
- Redis
- Docker & Docker Compose
- Prometheus & Grafana
- API Open-Meteo pour la météo

---

## Prérequis

- Node.js 18+
- Docker & Docker Compose
- Git

---

## Installation et lancement

### 1. Cloner le projet
```bash
git clone <repo-url>
cd pokedexMeteo
```

### 2. Lancer les services en développement
```bash
docker compose up --build
```

### 3. Lancer les services en production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Ports utilisés (dev)
- `pokedex-service` : 4000
- `weather-service` : 4001
- `MongoDB` : 27017
- `Redis` : 6379
- `Grafana` : 3000
- `Prometheus` : 9090

### 5. Arrêter les services
```bash
docker compose down
```

---

## Structure du projet

```
pokedexMeteo/
│
├─ pokedex-service/          # Service Pokémon
│   ├─ dist/                 # Build TypeScript
│   ├─ models/               # Interfaces de l'app
│   ├─ index.ts              # Serveur Express Pokémon
│   └─ Dockerfile
│
├─ weather-service/          # Service météo
│   ├─ dist/
│   ├─ models/               # Interfaces de l'app
│   ├─ index.ts              # Serveur Express météo
│   └─ Dockerfile
│
├─ docker-compose.yml        # Dev
├─ docker-compose.prod.yml   # Prod
├─ prometheus/               # Config Prometheus
│   └─ prometheus.yml
└─ .env                      # Variables Grafana (admin user/password)
```

---

## Services et endpoints

### pokedex-service (`index.ts`)

- Connecté à **MongoDB** pour récupérer les Pokémon (`PokemonType`).
- Calcule les effets météo sur les stats d’un Pokémon via la fonction `computeWeatherEffects`.

**Endpoints principaux :**

1. Liste tous les Pokémon
```http
GET /pokemon
```

2. Récupère un Pokémon avec les effets météo selon la ville
```http
GET /pokemon/:city/:uid
```
- Paramètres :
  - `city` : nom de la ville
  - `uid` : identifiant unique du Pokémon
- Réponse : Pokémon avec stats modifiées, état météo et effets

---

### weather-service (`index.ts`)

- Connecté à **Redis** pour le cache des requêtes météo.
- Interroge **Open-Meteo API** pour récupérer les données météo.

**Endpoint principal :**
```http
GET /weather?city=Paris
```
- Paramètres : `city` (obligatoire)
- Réponse : météo de la ville avec `temperature`, `weathercode`, `state`
- Utilise Redis pour stocker le cache et éviter trop de requêtes externes

---

## Seed de la base de données

- Le fichier `seed.js`/`dist/seed.js` permet de remplir MongoDB avec des Pokémon.
- Il peut être lancé manuellement via Docker ou directement avec Node :
```bash
node dist/seed.js
```
- Par défaut, il se lance automatiquement avec le docker-compose.

---

## Redis et cache

- Clé pour chaque ville : `weather:<city>`
- TTL configuré via `CACHE_TTL_SECONDS` (par défaut 600s)
- Commande pour voir les clés dans le conteneur Redis :
```bash
docker exec -it <redis-container-name> redis-cli
keys *
```

---

## Monitoring

- **Prometheus** : collecte des métriques depuis `weather-service` et `pokedex-service`.  
- **Grafana** : lit Prometheus et affiche des dashboards pour visualiser l’état des services.  
- Les dashboards Grafana sont accessibles via le port 3000 en dev ou via Nginx (ports 80/443) en prod.  
- Les services communiquent sur le réseau interne `monitoring_net` pour sécuriser les accès.

---

## Fichier `.env`

- Contient les variables sensibles pour Grafana :
```env
GF_SECURITY_ADMIN_USER=monadmin
GF_SECURITY_ADMIN_PASSWORD=monmotdepasse
```
- Permet de sécuriser l’accès admin à Grafana.
- Ne pas commit dans un repo public.
- En production, utiliser un mot de passe fort et/ou un gestionnaire de secrets.

---

## Notes

- Le fichier `docker-compose.yml` est pour le **développement** (build local, ports exposés).  
- Le fichier `docker-compose.prod.yml` est pour la **production** (images depuis Docker Hub, ports internes, reverse proxy Nginx).  
- Chaque service a ses images **dev** et **prod** sur Docker Hub pour gérer différents environnements.
