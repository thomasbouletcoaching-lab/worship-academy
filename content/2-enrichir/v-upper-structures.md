---
id: v-upper-structures
titre: Structures supérieures
niveau: 2
niveau_nom: Intermédiaire
categorie: Voicings
module: M9
ordre: 11
prerequis: [v-empilement, c-dom7, c-extensions]
liens_avant: [c-extensions, v-empilement]
liens_apres: [v-poly-accords]
emotions: [victoire, attente]
tempo_cible: "60-90 BPM"
duree_min: 25
---

> **Niveau** : 2 · Intermédiaire · **Catégorie** : Voicings · **Module** : M9 · **Prérequis** : Extensions 9, 11, 13 ; Accords de dominante 7 ; Deux mains, deux accords

## 1 · L'idée en une phrase

**Une triade posée au-dessus d'une basse de dominante fabrique automatiquement des extensions, si bien que la couleur complexe de l'accord vient d'une simple superposition de trois notes.**

## 2 · Comprendre

Imagine une assemblée qui se tient sous une voix grave, un pilier qui pose les fondations. Au-dessus, un petit groupe de voix chante une mélodie complète, pure et lumineuse, avec ses trois notes bien identifiables. Le pilier ne change pas. Les voix du haut sonnent comme des étages supplémentaires d'un même bâtiment : on les perçoit séparément, mais elles se tiennent ensemble.

Une structure supérieure fonctionne de cette manière. La main gauche tient un accord de dominante, par exemple une septième, qui sert de pilier. La main droite joue une triade complète, une seule, qui se pose au-dessus. Les notes de cette triade ne sont pas choisies au hasard : elles deviennent les extensions de l'accord du bas, c'est-à-dire la neuvième, la onzième augmentée et la treizième. Le son est riche, presque orchestral, mais le geste reste simple.

## 3 · Sous le capot

Le principe est une lecture par intervalles. Une extension se mesure à partir de la fondamentale de l'accord de base. La neuvième est une seconde majeure plus une octave, soit 14 demi-tons. La onzième est une quarte juste plus une octave, soit 17 demi-tons. La onzième augmentée (#11) est une quarte augmentée (un triton) plus une octave, soit 18 demi-tons. La treizième est une sixte majeure plus une octave, soit 21 demi-tons. Dans la pratique, on réduit tout à l'intérieur d'une octave : la neuvième devient une seconde majeure (2), la #11 un triton (6), la treizième une sixte majeure (9).

Prenons C7 (Do septième de dominante). Il contient C (Do), E (Mi), G (Sol) et Bb (Si bémol). Sa fondamentale est C. Si l'on pose au-dessus la triade de Ré majeur, formée de D (Ré), F# (Fa dièse) et A (La), que se passe-t-il ? D est à 2 demi-tons de C, c'est une neuvième. F# est à 6 demi-tons de C, c'est la onzième augmentée. A est à 9 demi-tons de C, c'est la treizième. La triade de Ré majeur sur une basse de Do dominant donne donc C7(9, #11, 13).

Vérifions les intervalles dans la triade elle-même : D vers F# fait 4 demi-tons (tierce majeure, 62 - 66 = 4), F# vers A fait 3 demi-tons (tierce mineure, 69 - 66 = 3). Confirmé : c'est bien une triade majeure. Et le total, de C à A, vaut 9 demi-tons pour la treizième.

Deuxième exemple, en tonalité de Sol (G) : G7 contient G (Sol), B (Si), D (Ré) et F (Fa). Posons au-dessus la triade de La majeur (A, C#, E). A est à 2 demi-tons de G, c'est la neuvième. C# est à 6 demi-tons de G, c'est la #11. E est à 9 demi-tons de G, c'est la treizième. Donc G7(9, #11, 13), sans quinte, car la quinte D n'apparaît pas dans la triade : c'est un accord dense où la quinte se laisse deviner.

Un point d'attention concerne la tierce et la septième. Si la main droite n'a que la triade, la main gauche doit garder la tierce et la septième de la dominante, qui sont les notes qui définissent l'accord. Dans C7, ce sont E et Bb, séparées d'un triton (6 demi-tons). Dans G7, ce sont B et F, séparées aussi d'un triton. Le triton est la signature de la dominante : sans lui, l'accord perd son identité.

Cas limite : une triade mineure au-dessus de la basse produit aussi des extensions, mais avec une couleur plus sombre. Dm sur C donne C(9, 11, 13) : D est la neuvième, F la onzième (quarte juste, 5 demi-tons), A la treizième. Ce n'est plus une #11, c'est une onzième juste, donc un accord plus suspendu, plus doux.

## 4 · Au clavier

Tonalité de référence : Do majeur.

**C7(9, #11, 13) : basse C3, E3, Bb3 en MG ; triade de Ré majeur D4, F#4, A4 en MD**

| Main | Note | Doigt | Rôle |
|---|---|---|---|
| MG | C3 (48) | 5 | fondamentale |
| MG | E3 (52) | 3 | tierce de la dominante |
| MG | Bb3 (58) | 1 | septième, la note la plus haute de la MG |
| MD | D4 (62) | 1 | neuvième |
| MD | F#4 (66) | 3 | onzième augmentée |
| MD | A4 (69) | 5 | treizième |

Vérifications : 52 - 48 = 4 (tierce majeure), 58 - 52 = 6 (le triton E-Bb, tierce et septième de la dominante), 62 - 58 = 4 (tierce majeure entre la MG et la MD), 66 - 62 = 4 (tierce majeure, D-F#), 69 - 66 = 3 (tierce mineure, F#-A). La triade D-F#-A est donc bien une triade de Ré majeur. L'écart entre Bb3 et D4 est de 4 demi-tons, il n'y a donc pas de croisement de mains.

**G7(9, #11, 13) : basse G3, B3, F4 en MG ; triade de La majeur A4, C#5, E5 en MD**

| Main | Note | Doigt | Rôle |
|---|---|---|---|
| MG | G3 (55) | 5 | fondamentale |
| MG | B3 (59) | 3 | tierce de la dominante |
| MG | F4 (65) | 1 | septième de la dominante |
| MD | A4 (69) | 1 | neuvième |
| MD | C#5 (73) | 3 | onzième augmentée |
| MD | E5 (76) | 5 | treizième |

Vérifications : 59 - 55 = 4 (tierce majeure), 65 - 59 = 6 (triton B-F), 69 - 65 = 4 (tierce majeure entre F et A), 73 - 69 = 4 (tierce majeure, A-C#), 76 - 73 = 3 (tierce mineure, C#-E). Triade de La majeur confirmée.

Attention à la MD : la triade reste dans le médium-aigu, mais elle doit rester au-dessus de la note F4 de la MG. Si tu descends la MD trop bas, le son devient trouble.

## 5 · Dans la louange

Le cas le plus courant est le refrain en Do. Pendant que la basse tient C3 (fondation), la main droite pose la triade de Ré mineur, D4-F4-A4. Ce voicing produit C(9, 11, 13), un accord dit « suspendu » qui se résout doucement. C'est ce que l'on appelle souvent « Dm sur C » dans les grilles de louange, et il offre une couleur lumineuse sans jamais sonner dramatique. Il convient à un refrain de confiance.

Pour un moment d'attente qui monte, la structure en G7(9, #11, 13) fonctionne bien. Avec la basse G3 et la triade de La majeur, tu crées une tension qui réclame une résolution. Quand l'assemblée entre dans un moment de victoire ou d'annonce, la résolution vers un accord de Do majeur C4-E4-G4 libère la tension.

Dernier cas : l'accompagnement d'une parole. Une structure supérieure peut être jouée très doucement, en maintenant seulement la basse et la triade, sans ajouter de mélodie. Cela laisse la voix du prédicateur nette, tout en donnant un fond riche.

## 6 · Exercices

### 🟢 Palier 1 — Découverte

Tempo : 60 BPM, une noire par temps. Joue la basse C3-E3-Bb3 en MG, avec la triade de Ré majeur D4-F#4-A4 en MD, pendant quatre mesures. Puis joue la basse G3-B3-F4 avec la triade de La majeur A4-C#5-E5 pendant quatre mesures.

Critère de réussite : huit mesures sans fausse note, et tu peux nommer les trois notes de chaque main sans regarder le clavier. Vérifie que la triade de la MD est bien majeure : tierce majeure en bas, tierce mineure en haut.

### 🟡 Palier 2 — Maîtrise

Tempo : 80 BPM. Alterne C7(9, #11, 13) et C(9, 11, 13) sur la basse C3, en remplaçant la triade de Ré majeur par la triade de Ré mineur D4-F4-A4. Deux mesures chacun, quatre fois.

Critère de réussite : tu entends le passage de la couleur lumineuse (#11) à la couleur suspendue (11) sans que la basse bouge, et la tierce mineure de Dm (F4) est audible.

### 🔴 Palier 3 — Virtuose

Tempo : 100 BPM. Sur une grille en Do puis en Sol : C7(9, #11, 13) vers C majeur (C4-E4-G4), puis G7(9, #11, 13) vers C majeur à nouveau, avec la triade de La majeur à la MD. Une mesure par accord.

Critère de réussite : deux minutes sans interruption, la résolution sur C majeur est nette, et la basse G3 ou C3 est tenue par la MG sans trou.

## 7 · Oreille

Ce qu'il faut entendre : une structure supérieure sonne riche, mais elle a une couleur de « brillance ». La onzième augmentée (#11) donne un éclat particulier, comme une lumière qui traverse une vitre. Elle se distingue de la onzième juste (11), qui sonne plus doucement, presque plus repos.

Comment l'identifier : joue la basse seule (C3-E3-Bb3, c'est-à-dire un C7), puis ajoute la triade de Ré majeur. Écoute la couleur ajoutée, et demande-toi si le son devient plus brillant ou plus sombre. Puis remplace le Ré majeur par le Ré mineur : la brillance disparaît, la couleur devient plus douce.

Petit test : demande à un ami de jouer, sans te prévenir, soit la triade majeure au-dessus de la basse, soit la mineure. Tu réponds « brillant » ou « doux ». Fais dix essais. En cas d'erreur, réécoute la note F# (majeur) puis F (mineur) au-dessus de la basse, et repère la différence d'un demi-ton.

## 8 · Erreurs fréquentes

1. **Choisir une triade au hasard.** Une triade quelconque sur une basse de dominante ne donne pas toujours des extensions claires. Correction : calcule les intervalles entre la fondamentale et chaque note de la triade, et vérifie qu'elles correspondent à des 9, 11 ou 13.
2. **Oublier la tierce et la septième à gauche.** Sans elles, la dominante perd sa signature. Correction : garde toujours la tierce et la septième de la dominante dans la MG.
3. **Jouer la triade trop bas.** Une triade placée dans le grave se confond avec la basse. Correction : garde-la dans le médium-aigu, à au moins une tierce au-dessus de la plus haute note de la MG.
4. **Confondre #11 et 11.** Une triade majeure et une triade mineure ne donnent pas la même couleur. Correction : écoute la tierce de la triade, et si elle est majeure, tu as une #11 ; si elle est mineure, tu as une 11.
5. **Ajouter une quinte à la MG.** Le son devient épais. Correction : la quinte de la dominante n'est pas nécessaire, la triade la suggère déjà.

## 9 · Liens

- Avant : Extensions 9, 11, 13 ; Deux mains, deux accords
- Ensuite : Poly-accords
