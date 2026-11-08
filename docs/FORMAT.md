# Format d'une fiche (contrat de contenu)

Chaque fiche est un fichier Markdown dans `content/<categorie>/<id>.md`.
Le frontmatter YAML est obligatoire. Le corps suit **exactement** les 9 blocs ci-dessous.

## Frontmatter

```yaml
---
id: b-repere-clavier            # identique au nom de fichier, kebab-case, unique
titre: Se repérer sur le clavier
niveau: 1                       # 1 SERVIR, 2 ENRICHIR, 3 MAÎTRISER
niveau_nom: Débutant            # Débutant | Intermédiaire | Avancé
categorie: Bases                # voir CURRICULUM.md (Bases, Application, Morceaux, Accords, Voicings, Rythme, Expressivité, Avancé, Modes, Modulations, Oreille, Composition, Groupe, Louange, Sons, Spirituel, Matériel)
module: M1                      # M1..M18 ou "Transversal"
ordre: 1                        # ordre dans le module
prerequis: []                   # ids de fiches
liens_avant: []                 # ids à voir avant (repris dans "Liens")
liens_apres: []                 # ids à voir ensuite
emotions: []                    # ex. [intimité, victoire, repentance, gratitude, attente] si pertinent, sinon []
tempo_cible: "60-100 BPM"       # si l'exercice est joué
duree_min: 20                   # temps d'étude estimé
---
```

## Corps (9 blocs, dans cet ordre, titres `##` exacts)

En-tête de niveau (callout en Markdown, une ligne) :
`> **Niveau** : … · **Catégorie** : … · **Module** : … · **Prérequis** : …`

1. `## 1 · L'idée en une phrase` : une seule phrase, forte, en gras possible.
2. `## 2 · Comprendre` : version vulgarisée, avec une image concrète (chœur, cordes, escalier, cuisine…).
3. `## 3 · Sous le capot` : théorie complète et profonde (intervalles en demi-tons, formules, pourquoi ça marche, cas limites).
4. `## 4 · Au clavier` : notes en lettres anglo-saxonnes **avec octave** (C4 = Do central), doigtés MG/MD en tableau, au moins un exemple dans 2 tonalités, et une note sur la tonalité de référence.
5. `## 5 · Dans la louange` : cas concrets d'église (couplet, refrain, prière, appel, cène, accompagnement de la parole…). Pas de jargon sans explication.
6. `## 6 · Exercices` : trois paliers, chacun avec BPM et critère de réussite mesurable :
   - `### 🟢 Palier 1 — Découverte`
   - `### 🟡 Palier 2 — Maîtrise`
   - `### 🔴 Palier 3 — Virtuose`
7. `## 7 · Oreille` : ce qu'il faut entendre, comment l'identifier à l'oreille, un petit test.
8. `## 8 · Erreurs fréquentes` : liste de 3 à 5 erreurs, avec la correction.
9. `## 9 · Liens` : `- Avant : …` et `- Ensuite : …` (titres des fiches liées).

## Règles de rédaction

- Français partout. Vouvoiement interdit : tutoiement chaleureux, ton de pédagogue.
- Notation : lettres anglo-saxonnes (C D E F G A B, dièses `#`, bémols `b`), avec le Do/Ré/Mi entre parenthèses **à la première occurrence** dans la fiche.
- Pas de partition. Pas de paroles de chants protégés. Grilles et exemples originaux uniquement.
- Chaque accord cité doit être juste. Vérifier chaque note deux fois (intervalles en demi-tons). Ne jamais écrire un voicing sans le justifier.
- Pas de polémique doctrinale ; sensibilité évangélique et charismatique large.
- Longueur cible : 1 200 à 2 000 mots par fiche.
