// Moments de culte : profil d'accompagnement attendu et évaluation d'une prise jouée.
export interface Profile {
  densite: [number, number]; // notes par seconde (min, max)
  velocite: [number, number]; // vélocité MIDI moyenne (min, max)
  aigu: number; // note la plus haute conseillée (MIDI)
  crescendo?: boolean; // la nuance doit monter au cours de la prise
}
export interface Moment {
  id: string; nom: string; dynamique: string; consignes: string[]; erreur: string;
  fond: string[]; // grille jouée en fond (chiffres)
  secParAccord: number;
  profil: Profile;
}

export const MOMENTS: Moment[] = [
  {
    id: 'priere', nom: 'Prière', dynamique: 'Très doux (pp). Accords tenus, presque immobiles.',
    consignes: ['Joue peu : un accord toutes les 2 à 4 secondes', 'Reste sous la voix de celui qui prie (pas au-dessus de C5)', 'Laisse des silences : la prière respire'],
    erreur: 'Ajouter des fills ou des arpèges rapides pendant la prière.',
    fond: ['1', '4/1', '1', '4/1'], secParAccord: 6,
    profil: { densite: [0.2, 1.5], velocite: [20, 60], aigu: 72 },
  },
  {
    id: 'appel', nom: 'Appel', dynamique: 'Crescendo progressif : de mp à f sur la durée.',
    consignes: ['Commence simple, enrichis à mesure que l’appel monte', 'Garde de la réserve pour la fin', 'Donne un départ clair au chant de réponse'],
    erreur: 'Monter trop vite et n’avoir plus de marge pour le dernier refrain.',
    fond: ['6m', '4', '1', '5'], secParAccord: 4,
    profil: { densite: [0.6, 4], velocite: [40, 100], aigu: 79, crescendo: true },
  },
  {
    id: 'cene', nom: 'Sainte cène', dynamique: 'Recueilli, p à mp. Discret.',
    consignes: ['Accords tenus, toucher léger', 'Pas de rythme marqué', 'Ne couvre jamais la parole'],
    erreur: 'Jouer comme en concert : ici la musique accompagne le recueillement.',
    fond: ['1', '6m', '4', '5sus'], secParAccord: 5,
    profil: { densite: [0.3, 2], velocite: [25, 65], aigu: 76 },
  },
  {
    id: 'offrande', nom: 'Offrande', dynamique: 'Modéré (mf), régulier.',
    consignes: ['Une grille simple en boucle', 'Rythme régulier, sans démonstration', 'Prépare une fin qui tombe juste'],
    erreur: 'Improviser longuement quand on attend la fin.',
    fond: ['1', '5', '6m', '4'], secParAccord: 3,
    profil: { densite: [1, 5], velocite: [50, 90], aigu: 81 },
  },
  {
    id: 'spontane', nom: 'Temps spontané', dynamique: 'Suit la conduite : tu restes dans un accord tant que rien ne change.',
    consignes: ['Écoute avant de jouer', 'Reste dans un accord ou une pédale', 'Suis la conduite, ne la devance pas'],
    erreur: 'Remplir le silence par réflexe.',
    fond: ['1', '1', '4/1', '1'], secParAccord: 5,
    profil: { densite: [0.2, 2.5], velocite: [25, 80], aigu: 79 },
  },
  {
    id: 'parole', nom: 'Sous la parole (underscore)', dynamique: 'Très doux, en retrait : un tapis sous la voix du pasteur.',
    consignes: ['Pad ou accords tenus, pas de mélodie', 'Évite le registre de la voix parlée (environ 100 à 300 Hz) : joue plus haut ou très doux', 'Change d’accord rarement'],
    erreur: 'Jouer une mélodie qui entre en concurrence avec la parole.',
    fond: ['1', '4', '1', '4'], secParAccord: 6,
    profil: { densite: [0.1, 1], velocite: [15, 55], aigu: 84 },
  },
];

export interface NoteEvent { note: number; velocity: number; at: number; } // at en secondes depuis le début
export interface Feedback { ok: boolean; message: string; }

export function evaluateMoment(events: NoteEvent[], duree: number, p: Profile): Feedback[] {
  const out: Feedback[] = [];
  if (!events.length) return [{ ok: false, message: 'Aucune note jouée. Même dans la prière, un accord tenu porte le moment.' }];
  const dens = events.length / duree;
  const vel = events.reduce((a, e) => a + e.velocity, 0) / events.length;
  const top = Math.max(...events.map((e) => e.note));
  const d = dens.toFixed(1);
  out.push(dens < p.densite[0]
    ? { ok: false, message: `Densité ${d} note/s : un peu trop clairsemé, le moment manque de soutien.` }
    : dens > p.densite[1]
      ? { ok: false, message: `Densité ${d} notes/s : trop chargé pour ce moment. Joue moins, laisse respirer.` }
      : { ok: true, message: `Densité ${d} notes/s : juste ce qu’il faut.` });
  const v = Math.round(vel);
  out.push(vel < p.velocite[0]
    ? { ok: false, message: `Nuance moyenne ${v}/127 : trop timide, on ne t’entend plus.` }
    : vel > p.velocite[1]
      ? { ok: false, message: `Nuance moyenne ${v}/127 : trop fort pour ce moment.` }
      : { ok: true, message: `Nuance moyenne ${v}/127 : adaptée.` });
  out.push(top > p.aigu
    ? { ok: false, message: `Note la plus haute trop aiguë : reste sous ${['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][p.aigu % 12]}${Math.floor(p.aigu / 12) - 1} pour laisser la place à la voix.` }
    : { ok: true, message: 'Registre : tu laisses la place à la voix.' });
  if (p.crescendo) {
    const half = duree / 2;
    const a = events.filter((e) => e.at < half);
    const b = events.filter((e) => e.at >= half);
    const va = a.length ? a.reduce((s, e) => s + e.velocity, 0) / a.length : 0;
    const vb = b.length ? b.reduce((s, e) => s + e.velocity, 0) / b.length : 0;
    out.push(vb > va + 8
      ? { ok: true, message: `Crescendo réussi (${Math.round(va)} → ${Math.round(vb)}).` }
      : { ok: false, message: 'Pas de vraie montée : commence plus doucement et ajoute nuance et notes dans la seconde moitié.' });
  }
  return out;
}
