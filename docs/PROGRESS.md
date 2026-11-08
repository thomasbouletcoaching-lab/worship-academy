# Progression — résumé pour le réveil

## En bref
- **Application** : https://thomasbouletcoaching-lab.github.io/worship-acaemy/ (déploiement GitHub Pages déclenché par le workflow sur `claude/**` ; à vérifier, Pages doit être activé dans les réglages du dépôt).
- **Formation** : 133 fiches dans `content/` (niveau 1 Servir, niveau 2 Enrichir, niveau 3 Maîtriser, transversal). Toutes passent le contrôle de format (`npm run content:check`) : frontmatter, 9 blocs, 3 paliers.
- **Tests** : 37 tests unitaires (théorie, gammes dans les 12 tonalités, voicings, Nashville, parseurs, rendu Markdown). `npm test` vert.

## Fait
- Moteur de théorie : notes orthographiées, accords (qualités courantes), renversements, voicings close / drop 2 / drop 3 / drop 2-4 / quartal / rootless, gammes et modes, accords diatoniques, Nashville.
- Application : bibliothèque, lecteur de fiches, dictionnaire d'accords (écoute + clavier animé, entrée MIDI), grilles Nashville, entraîneur d'oreille (intervalles), groupe virtuel (démo : métronome, basse, pad), pad de louange, visualiseur de fréquences, parcours guidé (validation locale), « Prêt pour dimanche », simulateur de moments de culte.
- Contenu : les 10 lots de rédaction sont terminés et commités.
- Relecture : une relecture théorique a commencé (lots A à D). Les corrections déjà faites (lot C, 31 fichiers, 33 lignes) sont commitées. Les lots A, B, D n'ont pas été relus.

## Reste (par priorité)
1. **Finir la relecture théorique** des 133 fiches. Les agents ont atteint la limite d'usage (reset 05:30 UTC). Relancer avec les listes de fichiers par lot (voir l'historique du commit « relecture »).
2. **Normaliser les catégories** des fiches sur `docs/CURRICULUM.md` (les rédacteurs ont choisi des noms libres : Progressions, Pentatonique, Avancé, Composition, Voicings, Modulations, Louange).
3. **`p-enrichies`** : le titre annonce « 25 progressions », la fiche présente surtout la méthode. À compléter.
4. **Niveau des fiches transversales** (sn-, mt-, sp-) : classées niveau 2 faute de niveau au sommaire. À valider.
5. **Application** : clavier MIDI et audio à tester en vrai navigateur (non vérifiés avec du matériel) ; module « Espace église » et « Simulateur » à enrichir ; mode hors ligne (service worker) non fait ; icônes PWA absentes.
6. **Notion** : publication des fiches dans une base « Bibliothèque » non faite (lecture seule utilisée ; la connexion Notion a été coupée en cours de session).

## Décisions
Voir `docs/DECISIONS.md`. Blocages et contournements : `docs/BLOCKERS.md`.
