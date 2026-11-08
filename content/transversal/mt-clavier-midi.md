---
id: mt-clavier-midi
titre: Contrôleur MIDI, DI et sorties
niveau: 2
niveau_nom: Intermédiaire
categorie: Matériel
module: Transversal
ordre: 1
prerequis: [b-repere-clavier]
liens_avant: [b-repere-clavier, sn-piano-numerique]
liens_apres: [mt-logiciels, mt-technicien-son]
emotions: []
tempo_cible: "60-80 BPM"
duree_min: 25
---

> **Niveau** : 2 ENRICHIR · **Catégorie** : Matériel · **Module** : Transversal · **Prérequis** : Se repérer sur le clavier

## 1 · L'idée en une phrase

**Ton contrôleur MIDI n'émet pas de son : il envoie des messages (notes, intensité, pédale) vers un logiciel ou un module, et la DI puis les sorties acheminent ensuite le son jusqu'à la salle sans le dégrader.**

## 2 · Comprendre

Pense à un chef d'orchestre qui écrit ses consignes sur des petits cartons, puis les distribue aux musiciens. Le carton ne fait pas de musique, il dit « joue le do, fort, pendant deux temps ». Le MIDI fonctionne ainsi : ton clavier envoie des cartons (des messages) à l'ordinateur ou au module de sons, qui fabrique le son. Tu peux donc changer d'instrument sans changer de clavier.

Une image plus concrète : un robinet et un tuyau. Le clavier est le robinet qui décide quand et combien d'eau couler. Le son est l'eau. Le tuyau (le câble, la DI, la console) doit transporter l'eau sans fuite ni pression parasite. Si le robinet est bon mais que le tuyau est percé, l'eau n'arrive pas proprement.

Dans la louange, ce matériel sert à passer d'un piano acoustique à un Rhodes, à une nappe ou à un orgue, parfois au milieu d'un chant. Comprendre les trois étapes (clavier, logiciel, sortie) te permet de dépanner seul avant le dimanche.

## 3 · Sous le capot

**Le protocole MIDI.** Le MIDI (Musical Instrument Digital Interface) transmet des messages et non de l'audio. Un message de note comporte : le numéro de la note, la vélocité (la force de frappe, de 1 à 127), le canal (de 1 à 16) et le type (note on, note off). Le numéro de note suit une convention : le Do central (C4) porte le numéro 60, le La 440 Hz (A4) le numéro 69. Le clavier couvre les numéros de 21 (A0) à 108 (C8) pour un 88 touches.

**La vélocité.** Un clavier envoie une valeur d'autant plus haute que tu frappes fort. Une vélocité de 64 correspond à une frappe moyenne, 100 à une frappe franche, 40 à un jeu doux. Les courbes de vélocité permettent d'adapter le toucher au son : une courbe trop sensible rend le piano brutal, une courbe trop plate le rend mou.

**Les contrôleurs continus.** Les messages *control change* (CC) portent des valeurs de 0 à 127 pour des paramètres. Les plus utiles : CC1 pour la modulation (vibrato), CC7 pour le volume, CC11 pour l'expression (un volume relatif), CC64 pour la pédale de sustain. La pédale envoie 127 quand elle est enfoncée et 0 quand elle est relâchée ; la plupart des logiciels considèrent qu'une valeur supérieure ou égale à 64 signifie « activé ».

**Le canal.** Chaque instrument reçoit les messages d'un canal donné. Si ton logiciel écoute le canal 1 et que ton clavier envoie sur le canal 2, tu n'entendras rien. Vérifie toujours le canal, surtout après avoir branché un nouveau clavier.

**La DI.** Une boîte DI (Direct Injection) transforme la sortie d'un instrument ou d'un module en signal équilibré, adapté à une console. Elle évite les bourdonnements (ronflement) qui apparaissent quand une sortie déséquilibrée parcourt de longs câbles. Elle a souvent un commutateur de masse (ground lift) pour couper une boucle de masse entre deux appareils reliés au même secteur.

**Les sorties.** Une sortie stéréo se compose de deux canaux, gauche (L) et droit (R). Si tu n'en branches qu'un, le son sera mono et décentré. Les sorties symétriques (XLR ou jack TRS) résistent mieux au bruit ; les sorties asymétriques (jack TS) sont plus sensibles, à éviter sur de longues distances.

**Cas limites.** Une pédale de sustain peut être « normalement ouverte » ou « normalement fermée » : si elle semble inversée, une option de polarité la corrige. La latence (le délai entre la frappe et le son) dépend de la taille de tampon de l'interface : à 48 kHz, un tampon de 128 échantillons donne environ 2,7 ms par tampon, un tampon de 512 donne environ 10,7 ms, perceptible en jeu rapide.

## 4 · Au clavier

La tonalité de référence de cette fiche est **C (Do) majeur**. Pour vérifier ton installation MIDI, joue une gamme ou un petit enchaînement et contrôle les numéros de notes que reçoit le logiciel. Rappel : 1 = pouce, 5 = auriculaire.

**Test d'une triade et de la pédale, en C majeur**

| Accord | Notes (nom) | Numéros MIDI | Doigts MD |
|---|---|---|---|
| C | C4 – E4 – G4 | 60 – 64 – 67 | 1 – 3 – 5 |
| F | F4 – A4 – C5 | 65 – 69 – 72 | 1 – 3 – 5 |
| G | G4 – B4 – D5 | 67 – 71 – 74 | 1 – 3 – 5 |
| C | C4 – E4 – G4 | 60 – 64 – 67 | 1 – 3 – 5 |

Pendant l'enchaînement, enfonce la pédale de sustain au premier accord et relâche-la au dernier. Si la pédale est inversée, les notes s'arrêtent au lieu de se prolonger.

**Même test en G majeur (I – IV – V – I de G, accords gardés dans le même registre)**

| Accord | Notes (nom) | Numéros MIDI | Doigts MD |
|---|---|---|---|
| G | G4 – B4 – D5 | 67 – 71 – 74 | 1 – 3 – 5 |
| C | C4 – E4 – G4 | 60 – 64 – 67 | 1 – 3 – 5 |
| D | D4 – F#4 – A4 | 62 – 66 – 69 | 1 – 3 – 5 |
| G | G4 – B4 – D5 | 67 – 71 – 74 | 1 – 3 – 5 |

Dans la tonalité de G, le F#4 (numéro 66) est le seul dièse de l'exemple. Si ton logiciel affiche 65 au lieu de 66 sur ce Fa, c'est soit une fausse note (F au lieu de F#), soit un décalage de transposition de −1 sur toutes les notes (le G4 s'afficherait alors 66) : dans ce cas, corrige-le dans le patch.

**Réglage des zones.** Sur un clavier à deux zones, la basse se joue sous le point de partage (souvent C3 ou B2), et la main droite au-dessus. Choisis ce point une fois pour toutes et écris-le sur le clavier.

## 5 · Dans la louange

**Le piano et le pad.** Pendant la prière, tu veux passer du piano au pad (une nappe de sons longs). Ton clavier envoie la note sur le canal 1 (piano) puis sur le canal 2 (pad), via deux zones ou un changement de programme. Tu n'as qu'à appuyer sur un bouton de patch : le pad répond sans coupure.

**La pédale d'expression.** Une pédale de volume permet de faire monter le son d'un Rhodes pendant un appel, sans toucher au clavier. Elle envoie du CC11 ou du CC7 : vérifie que le logiciel écoute bien le bon numéro.

**La DI et la salle.** Le dimanche, ta DI part vers la console de l'ingénieur du son. Si tu entends un ronflement, c'est souvent une boucle de masse : tu actives le ground lift et tu vérifies que la sortie de ton clavier n'est pas branchée sur deux prises secteur différentes.

Le vocabulaire utile : *patch* désigne un son enregistré dans l'instrument ou le logiciel ; *sustain* signifie prolongation des notes ; *latence* est le délai entre le toucher et le son ; *boucle de masse* est un chemin électrique parasite qui produit un ronflement.

## 6 · Exercices

### 🟢 Palier 1 — Découverte

**Tempo : 60 BPM.** Branche ton clavier et joue la triade de C majeur à la main droite, en tenant chaque accord trois secondes. Vérifie dans le logiciel que la note reçue est bien C4 (numéro 60).
**Critère de réussite :** les trois notes de l'accord de C s'affichent aux numéros 60, 64 et 67, sur quatre essais.

### 🟡 Palier 2 — Maîtrise

**Tempo : 70 BPM.** Enchaîne C – F – G – C avec la pédale de sustain. Passe ensuite d'un patch piano à un patch pad en cours de route, sans arrêt du son.
**Critère de réussite :** aucune note coupée à tort (la pédale tient sur tout le tag), et le changement de patch s'effectue en moins d'une seconde.

### 🔴 Palier 3 — Virtuose

**Tempo : 80 BPM.** Enchaîne C – F – G – C puis G – C – D – G sans arrêt. Pendant la transposition, la pédale d'expression fait monter le volume de la nappe de 40 % à 100 % sur quatre mesures.
**Critère de réussite :** la courbe de volume est régulière sur les huit mesures, et la latence perçue reste inférieure à 10 ms (tampon de 256 échantillons ou moins à 48 kHz).

## 7 · Oreille

Ce qu'il faut entendre : la note qui s'arrête trop tôt (pédale mal polarisée), la note qui sonne doux alors que tu as frappé fort (courbe de vélocité inadaptée), et le ronflement qui revient avec le mouvement des câbles (boucle de masse).

**Test.** Joue la même note deux fois, une fois doucement, une fois franchement. Écoute si le son change assez entre les deux. Si la différence est faible, ta courbe de vélocité est trop plate. Ensuite, joue un accord, relâche-le et tends l'oreille pour un ronflement. Si tu l'entends sous la musique, vérifie les masses.

## 8 · Erreurs fréquentes

- **Changer de clavier sans vérifier le canal.** Aucun son ne sort. *Correction :* contrôle le canal MIDI avant de chercher ailleurs.
- **Brancher la sortie mono sur une console stéréo.** Le son est décentré. *Correction :* utilise les deux sorties L et R, ou une sortie mono centrée sur les deux canaux.
- **Confondre pédale normalement ouverte et fermée.** La pédale semble ne rien faire, ou l'inverse. *Correction :* teste la pédale sur une note tenue et corrige la polarité.
- **Garder une latence trop haute.** Le jeu rapide devient flou. *Correction :* réduis la taille du tampon de l'interface tant que le système reste stable.
- **Ignorer les masses.** Le ronflement pollue toute la soirée. *Correction :* isole les appareils et utilise le ground lift de la DI plutôt que de débrancher la terre.

## 9 · Liens

- Avant : Se repérer sur le clavier ; Piano acoustique, Rhodes et pianos électriques
- Ensuite : MainStage, Ableton, Prime : rôles et réglages ; Travailler avec le technicien son
