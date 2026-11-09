# Progression

## État : les 14 points demandés sont faits, sauf la mise en ligne (une action de ta part)

### Contenu
1. **Relecture théorique** des 133 fiches : faite par 4 relecteurs (≈ 120 fiches corrigées : V de Sol, 7e de G7, gamme blues, doigtés impossibles, enharmonies, tempos hors fourchette…), puis 12 points douteux tranchés.
2. **`p-enrichies`** contient maintenant les 25 progressions (chiffres, accords en C, voicing main droite, usage en louange). Les fiches sont rangées par **section du sommaire** (déduite de l'id) et le transversal a son propre groupe.

### Application
3. **Exercices validés** (`S’entraîner`) : accords (avec basse imposée au palier 3), gammes au métronome, grilles au métronome avec basse virtuelle, note au micro. Mesures : justesse, écart rythmique en ms (tendance à presser ou traîner), régularité du toucher. Fonctionne au clavier MIDI ou au clavier à l’écran.
4. **Clavier dans les fiches** : chaque ligne qui contient des notes a un bouton 🎹 (clavier fixé en bas, écoute avec 5 sons, arpège, transposition demi-ton par demi-ton).
5. **Éditeur de grilles Nashville** : sections, mesures, accords slash (`1/3`), emprunts (`b7`), toutes qualités (`4maj7`, `5sus`, `2m7`…), erreurs en français, transposition, chiffres ↔ accords, impression / PDF, partage par code, 3 grilles d’exemple originales.
6. **Groupe virtuel** : batterie, basse, piano, pad, cordes, clic ; 5 grooves ; boucle de section ; coupure de chaque instrument ; voice leading automatique ; joue n’importe quelle grille du répertoire.
7. **Orgue et labo de sons** : orgue à 9 tirettes, 6 presets gospel, Leslie lent/rapide (avec accélération progressive), percussion ; comparaison piano / Rhodes / orgue / pad / cordes sur la même grille.
8. **Fréquences** interactives : on place basse, main gauche, main droite et voix ; diagnostic automatique (main gauche qui double la basse, intervalles trop graves, bas-médium « boueux », piano au-dessus du chanteur, trop de notes) ; spectre en direct.
9. **Oreille** en 6 modes × 3 niveaux : intervalles, qualités d’accords, degrés (« c’est le 4 »), mouvements de basse, progressions, modulations.
10. **Répétition espacée et statistiques** : validation d’une fiche → révisions programmées (difficile / moyen / facile), notions fragiles, série de jours, activité sur 14 jours, résultats d’oreille et d’exercices (page Progrès, accueil « Aujourd’hui »).
11. **Espace église** : équipe, import de la progression de chaque musicien (code), partage du set du dimanche (grilles comprises). « Prêt pour dimanche » : set, plan sur 7 jours, test final coché par chant.
12. **Hors ligne complet** : service worker qui met en cache tous les fichiers du build (vérifié : coupure réseau, toutes les pages s’ouvrent). Icônes PWA (192, 512, maskable, Apple).
13. **Notion** : base « Bibliothèque » créée sous Worship Academy, une page par fiche (voir `docs/BLOCKERS.md` pour le décompte final).
14. **Vérification** : 93 tests unitaires ; test de bout en bout `scripts/e2e.cjs` (18 pages × ordinateur et mobile, sans erreur ni débordement, + 8 parcours cliqués) ; build et tests verts dans GitHub Actions.

Aussi : simulateur de culte avec pratique de 30 s et retour (densité, nuance, registre, crescendo) ; dictionnaire avec 8 types de voicings et voice leading vers l’accord suivant ; pad live avec choix du son, swell et fondu ; parcours à déblocage (70 % du module précédent) avec mode confirmé.

## Ce qui reste de ton côté
- **Activer GitHub Pages** (voir `docs/BLOCKERS.md`) : c’est la seule chose qui empêche la mise en ligne.
- **Tester avec ton vrai clavier MIDI** dans Chrome ou Edge : la logique est testée, le matériel réel non.

## Pistes suivantes
- Export PDF d’une fiche (aujourd’hui : impression du navigateur).
- Enregistrement et réécoute de soi.
- Page de vente, séquence d’emails, scripts vidéo (bonus du brief initial).
- Synchronisation Supabase (point d’extension prêt : `src/lib/supabaseRepository.ts`).
