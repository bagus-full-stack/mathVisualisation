# MathViz

Une application Next.js pour visualiser, analyser et partager des fonctions mathématiques.

## Fonctionnalités

- **Visualisation 2D/3D** — tracé de fonctions avec zoom, réinitialisation, export PNG et historique persistant (par navigateur).
- **Analyse de fonctions** (`/analyse`) — dérivées, points critiques (recherche numérique sur une plage configurable) et intégrale définie (méthode des trapèzes).
- **Fonctions avancées** (`/fonctions-avancees`) — statistiques (min/max/moyenne, intervalles de croissance, points d'inflexion), comparaison de fonctions, tangentes, tableau de valeurs.
- **Visualisation N-dimensions** (`/dimensions`) — tranches, couleur comme dimension, animation, projection/isosurfaces pour des fonctions à plus de 3 variables.
- **Partage** (`/partage`) — génère un vrai lien de partage persistant en base de données (voir ci-dessous).

## Stack technique

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Plotly.js](https://plotly.com/javascript/) pour les graphiques
- [mathjs](https://mathjs.org) pour le calcul symbolique/numérique
- [Turso](https://turso.tech) (libSQL) pour la persistance des liens de partage

## Démarrer en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Base de données (liens de partage)

Par défaut, l'app utilise un fichier SQLite local (`local.db`) — aucune configuration requise en dev. Pour utiliser une vraie base Turso en production, définis ces variables d'environnement :

```bash
TURSO_DATABASE_URL=libsql://<ta-base>.turso.io
TURSO_AUTH_TOKEN=<ton-token>
```

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — démarre le build de production
- `npm run lint` — lint du projet
