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
12. **Notation des noms** : on écrit la lettre d'abord, le nom français entre parenthèses à la première occurrence : « C (Do) ». Une fiche qui écrit « Do (C) » (ex. t-conduire) est à normaliser lors de la relecture finale.
13. **Niveau des fiches transversales** : sn-*, mt-*, sp-* sont classées en niveau 2 dans leur frontmatter quand le CURRICULUM ne donne pas de niveau ; à valider au réveil.
14. **Logiciels cités** : Prime (mt-logiciels) n'est pas dans le sommaire ; mention gardée, renvoi à la doc officielle.
15. **Sections du sommaire** : la section d'une fiche est déduite du préfixe de son id (`v-` → Voicings et empilement…), pas du champ libre `categorie`. Aucun fichier n'est réécrit, et la classification reste cohérente même si un rédacteur a choisi un autre nom.
16. **Déblocage du parcours** : un module s'ouvre quand 70 % du module précédent est validé ; un « mode confirmé » ouvre tout ; la bibliothèque reste toujours libre.
17. **Révisions** : SM-2 simplifié (1, 3, 7 jours puis intervalle × facilité). Une fiche ratée deux fois devient « notion fragile ».
18. **Seuils rythmiques** des exercices : écart moyen ≤ 60 / 35 / 20 ms selon le palier.
19. **Nashville** : un degré abaissé (`b3`, `b6`, `b7`) donne un accord majeur emprunté ; `#4` donne un diminué de passage.
20. **Partage sans serveur** : grilles, sets et progressions s'échangent par code texte (base64). Aucune donnée ne quitte l'appareil.
21. **Hors ligne** : service worker écrit à la main (pas de dépendance), liste de pré-cache générée au build.
22. **Audio** : tous les sons sont synthétisés en Web Audio (aucun échantillon, aucune licence à gérer). Tone.js n'a pas été nécessaire.
