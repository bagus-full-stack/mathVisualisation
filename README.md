# MathViz

Une application Next.js pour visualiser, analyser et partager des fonctions mathématiques.

## Fonctionnalités

- **Visualisation 2D/3D** — tracé de fonctions avec zoom, réinitialisation, export PNG et historique persistant (par navigateur).
- **Analyse de fonctions** (`/analyse`) — dérivées, points critiques (recherche numérique sur une plage configurable) et intégrale définie (méthode des trapèzes).
- **Fonctions avancées** (`/fonctions-avancees`) — statistiques (min/max/moyenne, intervalles de croissance, points d'inflexion), comparaison de fonctions, tangentes, tableau de valeurs.
- **Visualisation N-dimensions** (`/dimensions`) — tranches, couleur comme dimension, animation, projection/isosurfaces pour des fonctions à plus de 3 variables.
- **Objet 3D** (`/objet-3d`) — importe un maillage (`.obj`) ou un nuage de points (`.csv`/`.json`), avec bascule solide/filaire et réinitialisation de la caméra.
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

### Où trouver des fichiers 3D gratuits

Pour tester `/objet-3d`, voici des sources de modèles gratuits (privilégier un export `.obj` — les autres formats, ex. `.stl`, ne sont pas encore supportés) :

- [sketchfab.com](https://sketchfab.com) — filtrer par "Downloadable", export `.obj` souvent disponible.
- [polyhaven.com](https://polyhaven.com) — modèles CC0 (domaine public), `.obj` disponible directement.
- [free3d.com](https://free3d.com) — catalogue gratuit varié, plusieurs formats dont `.obj`.
- [thingiverse.com](https://thingiverse.com) — surtout pensé impression 3D, principalement `.stl`.
- [nasa3d.arc.nasa.gov](https://nasa3d.arc.nasa.gov) — modèles NASA (vaisseaux, planètes), plusieurs formats dont `.obj`.
- [3d.si.edu](https://3d.si.edu) — collection Smithsonian, export possible selon les objets.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — démarre le build de production
- `npm run lint` — lint du projet
