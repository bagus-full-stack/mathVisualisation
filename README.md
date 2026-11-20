# MathViz

Une application Next.js pour visualiser, analyser et partager des fonctions mathématiques.

## Fonctionnalités

- **Visualisation 2D/3D** — tracé de fonctions avec zoom, réinitialisation, export PNG et historique persistant (par navigateur).
- **Analyse de fonctions** (`/analyse`) — dérivées, points critiques (recherche numérique sur une plage configurable) et intégrale définie (méthode des trapèzes).
- **Fonctions avancées** (`/fonctions-avancees`) — statistiques (min/max/moyenne, intervalles de croissance, points d'inflexion), comparaison de fonctions, tangentes, tableau de valeurs.
- **Visualisation N-dimensions** (`/dimensions`) — tranches, couleur comme dimension, animation, projection/isosurfaces pour des fonctions à plus de 3 variables.
- **Objet 3D** (`/objet-3d`) — importe un maillage (`.obj`/`.stl`) ou un nuage de points (`.csv`/`.json`), avec bascule solide/filaire, réinitialisation de la caméra et un cube d'exemple.
- **Traitement d'image** (`/image`) — importe une image et applique l'algorithme choisi, entièrement dans le navigateur (images réduites à 1024 px max). Couleur : niveaux de gris, négatif, sépia, luminosité/contraste, gamma, posterisation, pixelisation, égalisation d'histogramme. Seuillage : manuel ou automatique (Otsu). Filtres : flou gaussien, médian, netteté (masque flou), relief. Contours : Sobel, Laplacien. Morphologie : dilatation, érosion. Fréquences : passe-bas / passe-haut par transformée de Fourier 2D (par canal RVB, masque gaussien). Les algorithmes à réglage ont un curseur, et un histogramme de luminance compare l'original au résultat. Pour en ajouter un, déclarer une entrée dans `ALGOS` (`components/image-processor.tsx`).
- **Partage** (`/partage`) — aperçu en direct de la fonction, puis génération d'un lien de partage persistant en base de données (voir ci-dessous). Seules les expressions mathématiques simples sont acceptées (sin, cos, sqrt, etc. avec la variable `x`), avec des limites de taille sur le titre, la description et l'expression.

Les champs de plage (min/max) acceptent n'importe quel nombre, positif ou négatif, avec point ou virgule. Si min est supérieur à max, les bornes sont triées au tracé.

Le thème clair/sombre suit le bouton de la barre de navigation (classe `.dark`), et l'interface est utilisable sur mobile.

## Stack technique

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Plotly.js](https://plotly.com/javascript/) pour les graphiques, en version allégée (`lib/plotly-lite.ts`) : seuls les tracés `scatter`, `heatmap`, `scatter3d`, `surface` et `mesh3d` sont inclus. Pour utiliser un autre type de tracé (`bar`, `pie`…), l'ajouter dans ce fichier.
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

Sur un serveur avec disque persistant (par exemple Coolify), tu peux aussi garder SQLite : monte un volume (ex. `/data`) et pointe `TURSO_DATABASE_URL` vers un fichier dessus, comme `file:/data/local.db`. Sans volume, les liens sont perdus à chaque redéploiement. Pense à sauvegarder ce fichier.

### Déploiement

Le dépôt se déploie tel quel (Next.js, `npm run build` puis `npm run start`). En production, un push sur `master` déclenche le redéploiement via un webhook GitHub.

### Où trouver des fichiers 3D gratuits

Pour tester `/objet-3d`, voici des sources de modèles gratuits (formats supportés : `.obj`, `.stl`) :

- [sketchfab.com](https://sketchfab.com) — filtrer par "Downloadable", export `.obj` souvent disponible.
- [polyhaven.com](https://polyhaven.com) — modèles CC0 (domaine public), `.obj` disponible directement.
- [free3d.com](https://free3d.com) — catalogue gratuit varié, plusieurs formats dont `.obj`.
- [thingiverse.com](https://thingiverse.com) — pensé pour l'impression 3D, principalement `.stl`.
- [nasa3d.arc.nasa.gov](https://nasa3d.arc.nasa.gov) — modèles NASA (vaisseaux, planètes), plusieurs formats dont `.obj`.
- [3d.si.edu](https://3d.si.edu) — collection Smithsonian, export possible selon les objets.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run start` — démarre le build de production
- `npm run lint` — lint du projet
- `npm test` — tests unitaires (parseurs de maillage, validation des partages)
