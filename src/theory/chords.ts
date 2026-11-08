// Accords : qualités, construction orthographiée, renversements, voicings (close, drop 2/3/2-4, shells, rootless).
import { Note, LETTERS, pc, noteName, LETTER_PC } from './notes';

/** Qualité : demi-tons depuis la fondamentale pour chaque degré. */
export const QUALITIES: Record<string, { name: string; tones: Record<number, number>; symbol: string }> = {
  maj: { name: 'majeur', symbol: '', tones: { 1: 0, 3: 4, 5: 7 } },
  min: { name: 'mineur', symbol: 'm', tones: { 1: 0, 3: 3, 5: 7 } },
  dim: { name: 'diminué', symbol: 'dim', tones: { 1: 0, 3: 3, 5: 6 } },
  aug: { name: 'augmenté', symbol: 'aug', tones: { 1: 0, 3: 4, 5: 8 } },
  sus2: { name: 'sus2', symbol: 'sus2', tones: { 1: 0, 2: 2, 5: 7 } },
  sus4: { name: 'sus4', symbol: 'sus4', tones: { 1: 0, 4: 5, 5: 7 } },
  '6': { name: 'majeur 6', symbol: '6', tones: { 1: 0, 3: 4, 5: 7, 6: 9 } },
  m6: { name: 'mineur 6', symbol: 'm6', tones: { 1: 0, 3: 3, 5: 7, 6: 9 } },
  maj7: { name: 'majeur 7', symbol: 'maj7', tones: { 1: 0, 3: 4, 5: 7, 7: 11 } },
  m7: { name: 'mineur 7', symbol: 'm7', tones: { 1: 0, 3: 3, 5: 7, 7: 10 } },
  '7': { name: 'dominante 7', symbol: '7', tones: { 1: 0, 3: 4, 5: 7, 7: 10 } },
  m7b5: { name: 'demi-diminué', symbol: 'm7b5', tones: { 1: 0, 3: 3, 5: 6, 7: 10 } },
  dim7: { name: 'diminué 7', symbol: 'dim7', tones: { 1: 0, 3: 3, 5: 6, 7: 9 } },
  add9: { name: 'add9', symbol: 'add9', tones: { 1: 0, 3: 4, 5: 7, 9: 14 } },
  maj9: { name: 'majeur 9', symbol: 'maj9', tones: { 1: 0, 3: 4, 5: 7, 7: 11, 9: 14 } },
  m9: { name: 'mineur 9', symbol: 'm9', tones: { 1: 0, 3: 3, 5: 7, 7: 10, 9: 14 } },
  '9': { name: 'dominante 9', symbol: '9', tones: { 1: 0, 3: 4, 5: 7, 7: 10, 9: 14 } },
  '7b9': { name: 'dominante 7 b9', symbol: '7b9', tones: { 1: 0, 3: 4, 5: 7, 7: 10, 9: 13 } },
  '7#9': { name: 'dominante 7 #9', symbol: '7#9', tones: { 1: 0, 3: 4, 5: 7, 7: 10, 9: 15 } },
  '7#11': { name: 'dominante 7 #11', symbol: '7#11', tones: { 1: 0, 3: 4, 5: 7, 7: 10, 11: 18 } },
  '7b13': { name: 'dominante 7 b13', symbol: '7b13', tones: { 1: 0, 3: 4, 5: 7, 7: 10, 13: 20 } },
  '13': { name: 'dominante 13', symbol: '13', tones: { 1: 0, 3: 4, 5: 7, 7: 10, 9: 14, 13: 21 } },
};

/** Degré → lettres d'écart (1 = même lettre, 3 = +2 lettres…). */
const DEGREE_STEPS: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 9: 1, 11: 3, 13: 5 };

export interface Chord {
  root: Note;
  quality: string;
  /** Notes orthographiées, de la fondamentale vers les extensions (ordre de construction). */
  notes: Note[];
  /** Notes accordées dans l'ordre degré. Chaque élément porte le degré. */
  degrees: number[];
  symbol: string;
  name: string;
}

/** Construit un accord orthographié (ex. Ebmaj7 : Eb G Bb D). */
export function buildChord(root: Note, quality: string): Chord {
  const q = QUALITIES[quality];
  if (!q) throw new Error(`Qualité inconnue : ${quality}`);
  const degrees = Object.keys(q.tones).map(Number).sort((a, b) => a - b);
  const notes: Note[] = degrees.map((d) => {
    const steps = DEGREE_STEPS[d];
    const letter = LETTERS[(LETTERS.indexOf(root.letter) + steps) % 7];
    const want = (pc(root) + q.tones[d]) % 12;
    const natural = LETTER_PC[letter];
    let acc = (((want - natural) % 12) + 12) % 12;
    if (acc > 6) acc -= 12; // altération la plus petite (−6..+6)
    return { letter, acc };
  });
  return { root, quality, notes, degrees, symbol: `${noteName(root)}${q.symbol}`, name: `${noteName(root)} ${q.name}` };
}

/** Renversement : 0 = position fondamentale, 1 = 1er renversement (tierce à la basse)… */
export function invertNotes(chord: Chord, inversion: number): Note[] {
  const n = chord.notes.length;
  const k = ((inversion % n) + n) % n;
  return [...chord.notes.slice(k), ...chord.notes.slice(0, k)];
}

/**
 * Position serrée ascendante : la première note est à `bassMidi`, chaque note suivante
 * est la plus petite hauteur au-dessus de la précédente ayant la bonne classe de hauteur.
 */
export function closeVoicing(notesBottomUp: Note[], bassMidi: number): number[] {
  const out: number[] = [bassMidi];
  let last = bassMidi;
  for (let i = 1; i < notesBottomUp.length; i++) {
    const target = pc(notesBottomUp[i]);
    let m = last + 1;
    while (((m % 12) + 12) % 12 !== target) m++;
    out.push(m);
    last = m;
  }
  return out;
}

/** Position serrée à partir d'une fondamentale en MIDI, dans l'ordre des notes de l'accord. */
export function closeFromRoot(chord: Chord, rootMidi: number): number[] {
  return closeVoicing(chord.notes, rootMidi);
}

/** Drop N : on descend la note n-ième en partant du haut (drop 2 = 2e note depuis le haut), d'une octave. */
export function dropVoicing(closeMidi: number[], dropRank: number): number[] {
  const sorted = [...closeMidi].sort((a, b) => a - b);
  const idx = sorted.length - dropRank; // rang depuis le haut
  const out = [...sorted];
  out[idx] -= 12;
  return out.sort((a, b) => a - b);
}

/** Drop 2-4 : on descend la 2e et la 4e note depuis le haut (accords à 4 sons). */
export function drop24Voicing(closeMidi: number[]): number[] {
  const sorted = [...closeMidi].sort((a, b) => a - b);
  const out = [...sorted];
  out[sorted.length - 2] -= 12;
  out[sorted.length - 4] -= 12;
  return out.sort((a, b) => a - b);
}

/** Shell : fondamentale + tierce + septième (accords à 4 sons). */
export function shellVoicing(chord: Chord): Note[] {
  const keep = chord.degrees.map((d, i) => (d === 1 || d === 3 || d === 7 ? i : -1)).filter((i) => i >= 0);
  return keep.map((i) => chord.notes[i]);
}

/** Symbole lisible (ex. "Cmaj7", "Dm7", "G7"). */
export const chordSymbol = (c: Chord) => c.symbol;

/** Vérifie qu'un accord est bien orthographié : chaque note est sur la bonne pc. */
export function isWellFormed(chord: Chord): boolean {
  return chord.notes.every((n, i) => {
    const d = chord.degrees[i];
    const want = (pc(chord.root) + QUALITIES[chord.quality].tones[d]) % 12;
    return pc(n) === want;
  });
}


/**
 * Accord quartal : on empile des quartes justes (5 demi-tons) à partir de la fondamentale.
 * Renvoie les notes orthographiées (lettres à 3 pas de distance).
 */
export function quartalStack(root: Note, count = 4): Note[] {
  const out: Note[] = [];
  let letterIdx = LETTERS.indexOf(root.letter);
  for (let i = 0; i < count; i++) {
    const letter = LETTERS[(letterIdx + 3 * i) % 7];
    const want = (pc(root) + 5 * i) % 12;
    let acc = (((want - LETTER_PC[letter]) % 12) + 12) % 12;
    if (acc > 6) acc -= 12;
    out.push({ letter, acc });
  }
  return out;
}

/** Rootless A : tierce, quinte, septième, neuvième (sans fondamentale). */
export function rootlessA(chord: Chord): Note[] {
  return chord.notes.filter((_, i) => [1, 2, 3, 4].includes(i) && chord.degrees[i] !== 1);
}

/** Rootless B : tierce, septième, neuvième, treizième (sans fondamentale ni quinte). */
export function rootlessB(chord: Chord): Note[] {
  return chord.notes.filter((_, i) => [3, 5, 7, 9, 13].includes(chord.degrees[i]) && chord.degrees[i] !== 1 && chord.degrees[i] !== 5);
}
