// Générateurs d'exercices (aléatoires mais reproductibles avec une graine).
import { parseNote, pc, toMidi, Note } from '../../theory/notes';
import { buildChord, Chord, QUALITIES } from '../../theory/chords';
import { buildScale } from '../../theory/scales';
import { barToChords } from '../nashville/nashville';

export type Rng = () => number;
/** Générateur pseudo-aléatoire déterministe (mulberry32). */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = <T,>(arr: T[], rng: Rng = Math.random): T => arr[Math.floor(rng() * arr.length)];

export const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
export const PALIER_QUALITIES: Record<1 | 2 | 3, string[]> = {
  1: ['maj', 'min'],
  2: ['maj', 'min', 'maj7', 'm7', '7', 'sus4', 'sus2'],
  3: ['maj7', 'm7', '7', 'm7b5', 'dim7', 'aug', 'maj9', 'm9', '9', '13', '7b9'],
};
export const PALIER_BPM: Record<1 | 2 | 3, number> = { 1: 60, 2: 76, 3: 92 };

export interface ChordTarget { chord: Chord; pcs: number[]; bassPc?: number; label: string; }

/** Accord à jouer. Au palier 3, on impose parfois un renversement (basse imposée). */
export function randomChord(palier: 1 | 2 | 3, rng: Rng = Math.random): ChordTarget {
  const chord = buildChord(parseNote(pick(KEYS, rng)), pick(PALIER_QUALITIES[palier], rng));
  const pcs = chord.notes.map(pc);
  if (palier === 3 && rng() < 0.4 && chord.notes.length >= 3) {
    const bass = chord.notes[1];
    return { chord, pcs, bassPc: pc(bass), label: `${chord.symbol}/${bass.letter}${bass.acc === 1 ? '#' : bass.acc === -1 ? 'b' : ''}` };
  }
  return { chord, pcs, label: chord.symbol };
}

/** Gamme montante sur une octave (8 notes) à partir de la tonique à l'octave 4 (ou 3 pour les tonalités hautes). */
export function scaleTarget(key: string, mode = 'ionian'): number[] {
  const tonic = parseNote(key);
  const scale = buildScale(tonic, mode);
  const start = toMidi(tonic, pc(tonic) >= 7 ? 3 : 4);
  const out: number[] = [start];
  for (let i = 1; i < 7; i++) {
    let m = out[i - 1] + 1;
    while (((m % 12) + 12) % 12 !== pc(scale[i])) m++;
    out.push(m);
  }
  out.push(start + 12);
  return out;
}

export const PROGRESSIONS: { nom: string; bars: string[] }[] = [
  { nom: 'Les 4 accords (1 5 6m 4)', bars: ['1', '5', '6m', '4'] },
  { nom: 'Ballade (1 4 6m 5)', bars: ['1', '4', '6m', '5'] },
  { nom: 'Montée (4 5 6m 1)', bars: ['4', '5', '6m', '1'] },
  { nom: 'Cadence 2-5-1', bars: ['2m7', '57', '1maj7', '1maj7'] },
  { nom: 'Gospel (1 1/3 4 5)', bars: ['1', '3m', '4', '5'] },
];

export function progressionTarget(key: string, bars: string[]): Chord[] {
  return bars.map((b) => barToChords(key, b)[0]);
}

export function noteLabel(n: Note) {
  return `${n.letter}${n.acc === 1 ? '#' : n.acc === -1 ? 'b' : n.acc === 2 ? '##' : n.acc === -2 ? 'bb' : ''}`;
}

export const ALL_QUALITIES = Object.keys(QUALITIES);
