# Worship Academy

La formation de piano de louange : passer de « je voudrais servir par la musique » à « j’accompagne la louange en autonomie ».

**App** : https://thomasbouletcoaching-lab.github.io/worship-acaemy/ (après activation de GitHub Pages, voir `docs/BLOCKERS.md`)

## Ce que contient le dépôt
- **133 fiches** (`content/`) : niveaux 1 Servir, 2 Enrichir, 3 Maîtriser, et transversal (sons, matériel, spirituel). Format en 9 blocs : `docs/FORMAT.md`. Sommaire : `docs/CURRICULUM.md`.
- **L’application** (Vite + React + TypeScript + Tailwind, PWA hors ligne) :
  - parcours guidé à déblocage, bibliothèque avec recherche, fiches avec clavier interactif ;
  - exercices validés au clavier MIDI, au clavier à l’écran ou au micro ;
  - dictionnaire d’accords et de voicings, grilles Nashville, groupe virtuel, orgue et labo de sons, pad de louange ;
  - oreille (6 modes), fréquences, Prêt pour dimanche, simulateur de culte, espace église, progrès et révisions.
- **Moteur de théorie** testé (`src/theory/`) : toutes les données musicales sont calculées, jamais saisies à la main.

## Commandes
```bash
npm install
npm run dev            # développement
npm test               # 93 tests unitaires
npm run content:check  # contrôle du format des fiches
npm run build          # build de production (dist/, avec service worker)
npx vite preview --port 4173 & npm run e2e   # test de bout en bout (Playwright)
```

## Documents
`docs/PROGRESS.md` (état), `docs/DECISIONS.md`, `docs/BLOCKERS.md`, `docs/CURRICULUM.md`, `docs/FORMAT.md`.
