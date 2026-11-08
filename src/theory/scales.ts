// Gammes et modes orthographiés, degrés et accords diatoniques (Nashville / chiffrage romain).
import { Note, LETTERS, pc, noteName, transposeNote } from './notes';
import { buildChord, Chord } from './chords';

/** Intervalles en demi-tons depuis la tonique pour chaque mode (7 notes). */
export const MODES: Record<string, { name: string; steps: number[]; brightness: number }> = {
  ionian: { name: 'Ionien (majeur)', steps: [0, 2, 4, 5, 7, 9, 11], brightness: 6 },
  dorian: { name: 'Dorien', steps: [0, 2, 3, 5, 7, 9, 10], brightness: 5 },
  phrygian: { name: 'Phrygien', steps: [0, 1, 3, 5, 7, 8, 10], brightness: 1 },
  lydian: { name: 'Lydien', steps: [0, 2, 4, 6, 7, 9, 11], brightness: 7 },
  mixolydian: { name: 'Mixolydien', steps: [0, 2, 4, 5, 7, 9, 10], brightness: 4 },
  aeolian: { name: 'Éolien (mineur naturel)', steps: [0, 2, 3, 5, 7, 8, 10], brightness: 2 },
  locrian: { name: 'Locrien', steps: [0, 1, 3, 5, 6, 8, 10], brightness: 0 },
  melodicMinor: { name: 'Mineure mélodique', steps: [0, 2, 3, 5, 7, 9, 11], brightness: 3 },
  harmonicMinor: { name: 'Mineure harmonique', steps: [0, 2, 3, 5, 7, 8, 11], brightness: 2.5 },
  harmonicMajor: { name: 'Majeure harmonique', steps: [0, 2, 4, 5, 7, 8, 11], brightness: 5.5 },
};

/** Gamme orthographiée : chaque degré prend la lettre suivante (C D E F G A B…). */
export function buildScale(tonic: Note, mode: keyof typeof MODES | string = 'ionian'): Note[] {
  const m = MODES[mode];
  if (!m) throw new Error(`Mode inconnu : ${mode}`);
  const startIdx = LETTERS.indexOf(tonic.letter);
  return m.steps.map((semis, i) => {
    const letter = LETTERS[(startIdx + i) % 7];
    const target = (pc(tonic) + semis) % 12;
    const natural = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[letter];
    let acc = (((target - natural) % 12) + 12) % 12;
    if (acc > 6) acc -= 12;
    return { letter, acc };
  });
}

/** Accords diatoniques (triades empilées de tierces) sur chaque degré d'une gamme majeure ou mineure. */
export function diatonicTriads(tonic: Note, mode: string = 'ionian'): Chord[] {
  const scale = buildScale(tonic, mode);
  return scale.map((_, i) => {
    const a = scale[i];
    const b = scale[(i + 2) % 7];
    const c = scale[(i + 4) % 7];
    const third = ((pc(b) - pc(a)) + 12) % 12;
    const fifth = ((pc(c) - pc(a)) + 12) % 12;
    const quality = third === 4 && fifth === 7 ? 'maj' : third === 3 && fifth === 7 ? 'min' : third === 3 && fifth === 6 ? 'dim' : third === 4 && fifth === 8 ? 'aug' : 'maj';
    return buildChord(a, quality);
  });
}

/** Chiffrage romain : majuscule pour majeur, minuscule pour mineur, ° pour diminué. */
export function romanFor(chord: Chord, degree: number): string {
  const base = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][degree - 1];
  if (chord.quality === 'min') return base.toLowerCase();
  if (chord.quality === 'dim') return base.toLowerCase() + '°';
  return base;
}

export { noteName, transposeNote };
