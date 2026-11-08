# Décisions (prises en autonomie, à relire au réveil)

1. **Branche de travail** : `claude/exciting-pasteur-66lo86` (désignée par la session) au lieu de `main`. `main` reste intact. Le workflow de déploiement tourne sur `main` et sur `claude/**`.
2. **Dossier de contenu** : `content/1-servir/`, `content/2-enrichir/`, `content/3-maitriser/`, `content/transversal/` (un dossier par niveau, plus le transversal : sons, matériel, spirituel). Les ids et titres viennent de `docs/CURRICULUM.md`.
3. **Stack** : Vite 5 + React 18 + TypeScript + Tailwind 3 + Vitest. Versions anciennes et stables, figées dans `package.json`.
4. **Routage** : `HashRouter` (compatible GitHub Pages sans fichier 404 personnalisé). Base `/worship-acaemy/`.
5. **Stockage** : pas de backend pour l'instant. Le contenu est compilé dans l'app (import.meta.glob). Progression et préférences : localStorage avec try/catch, à migrer vers la couche Supabase plus tard.
6. **Moteur de théorie** : orthographe par lettres (C D E F G A B + altérations), tous les accords et voicings calculés, jamais saisis à la main. Testé sur les 12 tonalités.
7. **Format des fiches** : voir `docs/FORMAT.md` (frontmatter + 9 blocs). Une fiche = un fichier Markdown.
8. **Rédaction** : 10 sous-agents rédacteurs en parallèle, chacun avec une liste d'ids fixe. Git réservé à l'agent principal (évite les conflits).
9. **Licences** : toutes les dépendances sont MIT ou BSD/Apache. Aucune dépendance AGPL.
10. **Paroles** : aucune parole et aucune partition protégée. Grilles, structures et exemples originaux uniquement.
11. **Fiche modèle Drop 2** : la version Notion contient une erreur (tableau I–vi–IV–V, Cmaj7 « C3 + B3 »). Le rédacteur doit vérifier chaque voicing.
