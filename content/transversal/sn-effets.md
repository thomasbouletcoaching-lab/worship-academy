---
id: sn-effets
titre: "Réverbération, delay, chorus, pédales de volume, d'expression et de sustain"
niveau: 2
niveau_nom: Intermédiaire
categorie: Sons
module: Transversal
ordre: 5
prerequis: [sn-cordes-synthes]
liens_avant: [sn-cordes-synthes]
liens_apres: [mt-clavier-midi]
emotions: []
tempo_cible: "60-96 BPM"
duree_min: 25
---

> **Niveau** : 2 ENRICHIR (Intermédiaire) · **Catégorie** : Sons · **Module** : Transversal · **Prérequis** : Cordes, synthés, layering et splits

## 1 · L'idée en une phrase

**Les effets et les pédales donnent au son un espace, un écho et une respiration : bien réglés, ils font sonner une salle ; mal réglés, ils la noient.**

## 2 · Comprendre

Pense à la différence entre chanter dans une salle de bain et chanter sous une voûte d'église. Dans la salle de bain, le son revient vite et serré. Sous la voûte, il s'étire longtemps avant de s'éteindre. La réverbération imite cet espace. Le delay ajoute un écho, comme une voix qui répond depuis le fond d'un couloir. Le chorus fait vibrer le son pour l'épaissir, comme une chorale où chacun chante un peu décalé. Les pédales, enfin, permettent de tenir un son, de le moduler ou de le couper au bon moment.

Ces outils sont puissants parce qu'ils paraissent invisibles. Un bon réglage ne se remarque pas ; c'est l'impression de « justesse » qui reste. Un mauvais réglage se remarque tout de suite : le son est lointain, flou, brouillé.

## 3 · Sous le capot

**La réverbération.** Une réverbération simule les réflexions du son sur les murs d'une salle. Deux paramètres dominent. Le **temps de réverbération** (souvent noté RT60) est le temps que met le son à perdre 60 dB, soit à devenir presque inaudible. Une petite pièce a un RT60 de l'ordre d'une seconde ; une grande salle de culte peut dépasser deux secondes. Le **pre-delay** est le délai avant que la réverbération ne commence. Un pre-delay de 10 à 30 ms laisse le son sec entendre sa propre attaque avant de s'étendre : la voix reste nette.

**Le delay (écho).** Le delay répète le son après un temps donné. Son réglage le plus musical se fait en tempo. Une noire dure 60 000 divisé par le BPM : à 72 BPM, elle dure environ 833 ms. Une croche dure 417 ms. Une croche pointée (une croche plus la moitié d'elle-même, soit 3/4 de noire) dure 625 ms : c'est le réglage le plus fréquent, car chaque écho tombe entre deux temps et crée une respiration. À 96 BPM, la noire dure 625 ms et la croche pointée environ 469 ms.

Le **feedback** règle le nombre de répétitions : un feedback bas donne un seul écho ; un feedback élevé répète longtemps. Le **mix** règle le volume de l'écho par rapport au son sec. Pour un piano de louange, un mix de 15 à 25 % suffit souvent.

**Le chorus.** Le chorus copie le son avec un très petit délai, de l'ordre de 15 à 30 ms, et fait varier ce délai avec un LFO lent. Le résultat est une légère désaccordation et un épaississement. Il rappelle le détune de sn-cordes-synthes, mais par effet. Un chorus trop fort donne une impression de flou ; un chorus léger donne de la vie.

**La pédale de sustain.** Sur un piano numérique, la pédale de sustain envoie un message MIDI appelé CC64. Une valeur de 0 à 63 signifie pédale relâchée ; une valeur de 64 à 127 signifie pédale enfoncée. Sur un piano acoustique, la pédale lève les étouffoirs et laisse les cordes vibrer librement.

**La pédale d'expression et la pédale de volume.** Ces deux pédales ressemblent mais ne font pas la même chose. La pédale d'expression, souvent associée au message MIDI CC11, module le volume d'une partie du son sans toucher au volume général : elle sert à faire monter une nappe pendant qu'un piano reste stable. La pédale de volume, souvent associée à CC7, règle le niveau général de l'instrument : elle sert à entrer et sortir en douceur. En pratique, on utilise la pédale d'expression pour un swell interne, la pédale de volume pour une entrée ou une sortie.

**Pourquoi ça marche.** La réverbération place le son dans un espace, le delay le met en mouvement, le chorus le rend vivant, les pédales le tiennent et le font respirer. L'ensemble crée la sensation d'un lieu et d'un temps.

## 4 · Au clavier

Notation : C4 = do central. Tonalité de référence : **do majeur**. Les exercices sont en accord tenu, pour entendre l'effet sans distraction.

| Accord (do majeur) | Notes | Doigts MD | Effet |
|---|---|---|---|
| C | C4 (Do) + E4 (Mi) + G4 (Sol) | 1, 3, 5 | réverbération et chorus |
| C arpégé | C4, E4, G4, E4, C4 | 1, 3, 5, 3, 1 | delay à la croche pointée |

Vérifie : C4 = 261,6 Hz, E4 = 329,6 Hz, G4 = 392 Hz. Sur un arpège de C4 à G4, il y a 7 demi-tons, soit une quinte juste : l'arpège se joue d'une main sans étirement, ce qui permet de garder la pédale libre.

| Accord (sol majeur) | Notes | Doigts MD | Effet |
|---|---|---|---|
| G | G3 (Sol) + B3 (Si) + D4 (Ré) | 1, 3, 5 | réverbération et chorus |
| G arpégé | G3, B3, D4, B3, G3 | 1, 3, 5, 3, 1 | delay à la croche pointée |

Vérifie : G3 = 196 Hz, B3 = 246,9 Hz, D4 = 293,7 Hz. De G3 à B3, on compte 4 demi-tons (tierce majeure), puis de B3 à D4, 3 demi-tons (tierce mineure) : l'arpège est un empilement de tierces, idéal pour un delay qui révèle chaque note.

**Réglage de test.** À 72 BPM, règle le delay sur 625 ms (croche pointée). Joue C arpégé sur quatre mesures : chaque écho doit tomber entre deux temps. Si les échos se superposent aux notes, ton delay est trop court ou trop long.

**Tonalité de référence.** En do, les arpèges de reverb se placent facilement. En sol, les notes graves (G3, B3) s'étirent davantage avec une réverbération longue : coupe un peu les basses de la reverb.

## 5 · Dans la louange

**La prière dans un grand espace.** Une réverbération longue (environ deux secondes), un pre-delay de 20 ms et un mix de 25 % donnent une impression de cathédrale. La voix du pasteur y paraît posée et solennelle. Attention : la réverbération doit rester sous la voix, pas la noyer.

**Le delay sur un motif.** Pendant une transition, un motif de piano est répété en delay à la croche pointée. Le motif tourne en boucle sans avoir besoin d'être rejoué, ce qui laisse les mains libres pour changer d'accord.

**Le chorus pour l'élan.** Au refrain, un chorus léger sur le piano ou la nappe le rend plus vivant. L'assemblée ne perçoit pas l'effet, elle perçoit l'énergie.

**La pédale d'expression pour le swell.** Pendant une entrée, la pédale d'expression monte le volume d'une nappe pendant que le piano reste stable. Le swell est doux, contrôlé, et laisse la voix au premier plan.

## 6 · Exercices

### 🟢 Palier 1 — Découverte

Règle une réverbération courte (environ une seconde, pre-delay de 10 ms, mix de 20 %) et joue C4 - E4 - G4 tenu pendant huit secondes. Puis répète avec une réverbération longue (deux secondes). **Critère de réussite** : tu entends la différence entre la pièce petite et la grande salle, et tu peux dire laquelle convient à une prière.

### 🟡 Palier 2 — Maîtrise

Règle le delay à 72 BPM sur une croche pointée (625 ms), feedback modéré, mix de 20 %. Joue C arpégé (C4, E4, G4, E4, C4) à **72 BPM** pendant seize mesures. **Critère de réussite** : chaque écho tombe régulièrement entre deux temps (3/4 de temps après la note), la répétition n'accumule pas de bruit, et la voix d'un partenaire reste audible.

### 🔴 Palier 3 — Virtuose

Enchaîne une prière de quatre minutes à **66 BPM** : réverbération longue et pre-delay de 20 ms ; un swell de nappe par la pédale d'expression ; un delay à la croche pointée pendant la transition ; la pédale de sustain changée à chaque nouvel accord ; la pédale de volume qui sort en douceur à la fin. **Critère de réussite** : aucun effet n'attire l'attention ; l'enregistrement sonne comme un seul espace sonore cohérent.

## 7 · Oreille

**Ce qu'il faut entendre.** La réverbération : un son qui se prolonge comme dans un espace, sans écho distinct. Le delay : des répétitions nettes, espacées régulièrement. Le chorus : un son légèrement élargi, qui vibre comme s'il était joué à plusieurs. La pédale de sustain : des notes qui se mêlent au lieu de se succéder.

**Test à faire.** Joue C4 - E4 - G4 avec un delay à 625 ms, puis avec un delay à 500 ms. Demande à un partenaire de dire lequel des deux tombe « juste » sur le tempo de 72 BPM. Si l'on reconnaît la version à 625 ms, ton oreille a intégré la relation entre tempo et delay.

## 8 · Erreurs fréquentes

- **Réverbération trop longue.** La voix devient lointaine et les accords se mélangent. *Correction* : réduis le temps de réverbération et le mix jusqu'à retrouver l'intelligibilité.
- **Delay désynchronisé.** Les échos tombent à côté des subdivisions du tempo et créent du flou. *Correction* : règle le delay en millisecondes calculées à partir du BPM.
- **Chorus trop fort.** Le son devient mou et instable. *Correction* : réduis la profondeur et la vitesse du LFO.
- **Pédale de sustain toujours enfoncée.** Les accords se superposent. *Correction* : relâche la pédale à chaque changement, ou utilise les demi-coups.
- **Confondre pédale d'expression et pédale de volume.** Le swell se fait au mauvais endroit. *Correction* : affecte l'expression aux nappes, et le volume à l'entrée ou à la sortie du set.

## 9 · Liens

- Avant : Cordes, synthés, layering et splits
- Ensuite : Clavier MIDI, DI et sorties
