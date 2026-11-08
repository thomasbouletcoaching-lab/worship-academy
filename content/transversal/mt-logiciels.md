---
id: mt-logiciels
titre: MainStage, Ableton, Prime : rôles et réglages
niveau: 2
niveau_nom: Intermédiaire
categorie: Matériel
module: Transversal
ordre: 2
prerequis: [mt-clavier-midi]
liens_avant: [mt-clavier-midi, sn-piano-numerique]
liens_apres: [mt-technicien-son, t-set-dimanche]
emotions: []
tempo_cible: "60-80 BPM"
duree_min: 30
---

> **Niveau** : 2 ENRICHIR · **Catégorie** : Matériel · **Module** : Transversal · **Prérequis** : Contrôleur MIDI, DI et sorties

## 1 · L'idée en une phrase

**Un logiciel de scène sert à jouer le son au bon moment et de façon stable, tandis qu'un logiciel de production sert à préparer, enregistrer et caler le temps : chacun a son rôle, et les réglages décident de la fiabilité.**

## 2 · Comprendre

Pense à une cuisine de restaurant. Il y a la table de service, où l'on sert les plats dans l'ordre et sans attendre, et il y a la préparation en arrière-cuisine, où l'on coupe, mijote et prépare les fonds. Les deux travaillent ensemble, mais on ne cuisine pas pendant le service. Les logiciels de musique fonctionnent de la même façon : un logiciel de scène (la table de service) doit répondre instantanément ; un logiciel de production (l'arrière-cuisine) peut prendre son temps pour préparer des boucles et des pistes.

Une autre image : une bibliothèque de sons. Le logiciel est le rayon, chaque patch est un livre. Tu n'as pas besoin de tous les lire : tu dois savoir où se trouve celui dont tu as besoin pour le chant qui vient, et pouvoir le retrouver les yeux fermés.

Dans la louange, on utilise rarement un logiciel seul. Le plus fréquent est un logiciel de scène qui héberge plusieurs sons (piano, nappe, orgue), auquel s'ajoute parfois un logiciel de production pour les pistes ou le click.

## 3 · Sous le capot

**Le rôle d'un logiciel de scène.** Un logiciel de scène, comme MainStage (sur Mac), organise les sons par *patches* regroupés en *keyboard sets* (jeux de sons). Il gère la transposition, la répartition du clavier en zones, les courbes de vélocité et les effets, et il envoie le résultat vers la sortie audio. Sa priorité est la stabilité : il doit démarrer vite, ne pas planter, et conserver une latence faible.

**Le rôle d'un logiciel de production.** Une station audio numérique (DAW, *digital audio workstation*) comme Ableton Live permet de séquencer, de boucler et d'enregistrer. Sa vue « Session » est pratique pour lancer des boucles de nappes ou de pads ; sa vue « Arrangement » sert à caler une structure sur le temps. Le click (le métronome envoyé aux musiciens) se règle souvent ici.

**Le logiciel de sons.** Le sommaire mentionne aussi Prime. Je ne peux pas garantir ici l'ensemble de ses réglages, qui évoluent selon les versions : pour ce logiciel, suis la documentation officielle à jour. Les principes qui suivent s'appliquent à tout logiciel de sons : choisir la sortie audio, choisir le canal MIDI d'entrée, régler la polyphonie et charger une banque de sons.

**La latence.** La latence dépend de la taille du tampon (*buffer*) et de la fréquence d'échantillonnage. Un tampon de 128 échantillons à 48 kHz représente 128 / 48 000 = 2,67 ms par passage ; un tampon de 512 représente 10,67 ms. Un tampon plus petit réduit la latence mais sollicite davantage le processeur : le bon compromis est le plus petit tampon qui ne produit ni craquement ni coupure.

**La fréquence d'échantillonnage.** 44,1 kHz (CD) et 48 kHz (vidéo, scène) sont les plus courantes. L'essentiel est de choisir une fréquence et de la garder identique dans tous les logiciels et sur l'interface, sinon le son peut être décalé ou dégradé.

**La polyphonie.** C'est le nombre maximal de notes que le logiciel joue en même temps. Une nappe étirée sur plusieurs voix peut en consommer beaucoup. Si la polyphonie est atteinte, les premières notes sont coupées : prévois une marge.

**Le panic (all notes off).** Une commande d'urgence qui coupe toutes les notes bloquées. Un « note bloquée » est une note qui continue de sonner parce que sa fin n'a pas été reçue ; c'est fréquent après une déconnexion. Connais le raccourci de ton logiciel avant le dimanche.

**Cas limites.** Une mise à jour de système peut changer la sortie audio par défaut : vérifie-la avant chaque répétition. Un plugin non installé sur le second ordinateur fait échouer tout un projet : sauvegarde les sons et les dépendances.

## 4 · Au clavier

La tonalité de référence de cette fiche est **C (Do) majeur**. Voici une configuration simple de *keyboard set* : un piano sur la zone principale, une nappe sur la zone supérieure, transposables tous les deux.

| Zone | Son | Registre | Canal MIDI | Transposition |
|---|---|---|---|---|
| Basse | Piano | C2 à B3 | 1 | 0 |
| Piano principal | Piano | C3 à C6 | 1 | 0 |
| Nappe | Pad | C4 à C6 | 2 | 0 |

Le piano et la nappe partagent une zone centrale : c'est le *layering* (superposition). La nappe n'entend que la zone qui lui est assignée, sans toucher à la basse.

**Enchaînement de test en C majeur (main droite sur le piano, pédale tenue sur la nappe)**

| Accord | Notes MD | Doigts MD | Basse MG | Doigt MG |
|---|---|---|---|---|
| C | C4 – E4 – G4 | 1 – 3 – 5 | C3 | 5 |
| Am | A3 – C4 – E4 | 1 – 3 – 5 | A2 | 5 |
| F | F3 – A3 – C4 | 1 – 3 – 5 | F2 | 5 |
| G | G3 – B3 – D4 | 1 – 3 – 5 | G2 | 5 |

Les triades sont placées dans le registre de la main droite, et la basse sous elles. La nappe reçoit la même triade transposée à l'octave supérieure si tu la règles dans le logiciel.

**Transposition en G majeur (+7 demi-tons)** : la même séquence devient G – Em – C – D. Les notes à retenir sont G3–B3–D4 pour le premier accord, E3–G3–B3 pour le deuxième, puis C4–E4–G4 et D3–F#3–A3 pour les deux derniers. Le F# de l'accord de D est le seul dièse à vérifier avant le set.

Le réglage de transposition se fait dans le *keyboard set* et non dans chaque patch : si tu transposes d'un patch, le piano et la nappe partiront dans des directions différentes.

## 5 · Dans la louange

**Le set de dimanche.** Ton *keyboard set* est préparé le samedi. Il contient un patch piano pour les chants rythmés, une nappe pour la prière, un patch orgue pour l'appel. Chaque patch a un numéro et un nom qui se lit d'un coup d'œil : « Prière 1 », « Chant 2 ». Tu évites de chercher un son pendant la transition.

**Le click.** Dans une équipe avec batterie, le click vient souvent d'un logiciel de production. Il est envoyé au musicien seul, dans son retour in-ear, et non dans la salle. Le réglage se fait dans le logiciel de production, pas dans le logiciel de scène.

**La reprise.** Si le logiciel de scène plante en plein culte, tu n'as pas le temps de réparer. Prévois une version de secours : un patch piano acoustique sur un module ou sur ton piano, et un moyen de le lancer sans le logiciel. La règle est simple : le culte ne dépend jamais d'un seul point de défaillance.

Le vocabulaire utile : *patch* désigne un son enregistré ; *keyboard set* est un ensemble de patches organisés pour un morceau ou un moment ; *layering* est la superposition de deux sons sur la même zone ; *polyphonie* est le nombre de notes simultanées.

## 6 · Exercices

### 🟢 Palier 1 — Découverte

**Tempo : 60 BPM.** Crée un *keyboard set* avec un patch piano sur la zone principale. Joue la triade de C majeur à la main droite et vérifie que le son sort sans retard perceptible.
**Critère de réussite :** le son apparaît dès l'appui sur la touche, et le *keyboard set* se recharge en moins de cinq secondes après un redémarrage.

### 🟡 Palier 2 — Maîtrise

**Tempo : 70 BPM.** Ajoute une nappe sur la zone supérieure, avec un *layering* piano-nappe. Enchaîne C – Am – F – G, puis reviens à C avec la nappe seule.
**Critère de réussite :** la nappe est audible sans couvrir le piano, et la transition vers la nappe seule se fait sans coupure, sur deux passages.

### 🔴 Palier 3 — Virtuose

**Tempo : 80 BPM.** Transpose le *keyboard set* de +7 demi-tons (C majeur vers G majeur), sans toucher aux patches. Joue G – Em – C – D avec la nappe active, puis reviens en C.
**Critère de réussite :** la transposition est réglée en moins de dix secondes, et aucune note ne sonne en décalage de tonalité entre piano et nappe.

## 7 · Oreille

Ce qu'il faut entendre : le décalage entre le piano et la nappe (une transposition qui n'a pas été appliquée à tous les patches), la note qui reste bloquée après un arrêt, et le craquement qui signale un tampon trop petit.

**Test.** Joue un accord avec la nappe et le piano à la fois, puis arrête-toi. Si une note continue de sonner, tu as une note bloquée : déclenche le panic. Ensuite, réduis le tampon d'un cran et rejoue ; si des craquements apparaissent, reviens à la taille précédente.

## 8 · Erreurs fréquentes

- **Transposer un patch au lieu du set.** Les sons se désaccordent. *Correction :* règle la transposition au niveau du *keyboard set*.
- **Chercher le son pendant le chant.** Le moment est perdu. *Correction :* prépare et nomme les patches la veille.
- **Tampon trop petit.** Le processeur craque. *Correction :* augmente la taille du tampon d'un cran et reteste.
- **Ignorer la polyphonie.** Les premières notes disparaissent sur les accords denses. *Correction :* limite les voix des nappes ou augmente la marge.
- **Ne pas avoir de secours.** Un plantage bloque tout le culte. *Correction :* prépare un son de secours accessible sans logiciel.

## 9 · Liens

- Avant : Contrôleur MIDI, DI et sorties ; Piano acoustique, Rhodes et pianos électriques
- Ensuite : Travailler avec le technicien son ; Préparer un set pour le dimanche
