// Moteur de théorie : notes orthographiées (lettre + altération), MIDI, transposition.
// C4 = Do central = MIDI 60.

export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const LETTER_PC: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const LETTER_FR: Record<Letter, string> = { C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };

/** Note orthographiée : lettre + altération en demi-tons (−2 = bb, −1 = b, 0, +1 = #, +2 = x). */
export interface Note {
  letter: Letter;
  acc: number;
}

export const accSymbol = (acc: number): string => {
  if (acc === 0) return '';
  if (acc === 1) return '#';
  if (acc === -1) return 'b';
  if (acc > 0) return '##'.repeat(acc / 2) + (acc % 2 ? '#' : '');
  return 'bb'.repeat(-acc / 2) + (acc % 2 ? 'b' : '');
};

/** Classe de hauteur 0..11 (C = 0). */
export const pc = (n: Note): number => (((LETTER_PC[n.letter] + n.acc) % 12) + 12) % 12;

export const noteName = (n: Note): string => `${n.letter}${accSymbol(n.acc)}`;
export const noteNameFr = (n: Note): string => `${LETTER_FR[n.letter]}${accSymbol(n.acc)}`;

/** Parse "C", "F#", "Bb", "Ebb", "E##". */
export function parseNote(s: string): Note {
  const m = /^([A-G])((?:#|b|x)*)$/.exec(s.trim());
  if (!m) throw new Error(`Note invalide : ${s}`);
  const letter = m[1] as Letter;
  let acc = 0;
  for (const ch of m[2]) acc += ch === '#' ? 1 : ch === 'x' ? 2 : -1;
  return { letter, acc };
}

/** Hauteur MIDI d'une note à une octave donnée (C4 = 60). L'octave est celle de la lettre (B#3 = C4 selon la convention lettre). */
export function toMidi(n: Note, octave: number): number {
  return (octave + 1) * 12 + LETTER_PC[n.letter] + n.acc;
}

/** Note orthographiée depuis une classe de hauteur, en préférant dièses ou bémols. */
export function spellPc(p: number, preferFlats = false): Note {
  const sharps: [Letter, number][] = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];
  const flats: [Letter, number][] = [['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0]];
  const [letter, acc] = (preferFlats ? flats : sharps)[((p % 12) + 12) % 12];
  return { letter, acc };
}

/** Intervalle en demi-tons entre deux notes (0..11 modulo l'octave). */
export const semitonesBetween = (from: Note, to: Note): number => (((pc(to) - pc(from)) % 12) + 12) % 12;

/** Taille générique (nombre de lettres à franchir) pour chaque nombre de demi-tons 0..11. */
const GENERIC_STEPS = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6];

/**
 * Transpose une note de `semis` demi-tons en choisissant la lettre dont la taille générique
 * correspond à l'intervalle (ex. C + 3 = Eb, car une tierce mineure va d'une lettre à 2 lettres).
 */
export function transposeNote(n: Note, semis: number, preferFlats = false): Note {
  const k = ((semis % 12) + 12) % 12;
  const target = (pc(n) + k) % 12;
  const letter = LETTERS[(LETTERS.indexOf(n.letter) + GENERIC_STEPS[k]) % 7];
  let acc = (((target - LETTER_PC[letter]) % 12) + 12) % 12;
  if (acc > 6) acc -= 12;
  if (Math.abs(acc) > 2) return spellPc(target, preferFlats);
  return { letter, acc };
}

export const degreeFr = (letter: Letter) => LETTER_FR[letter];
