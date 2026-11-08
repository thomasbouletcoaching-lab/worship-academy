// Hauteurs avec octave (« C4 », « Bb3 », « F#5 ») ↔ MIDI, et repérage dans un texte.
import { parseNote, toMidi } from './notes';

const NOTE_RE = /(?<![A-Za-z0-9#])([A-G])(#{1,2}|b{1,2}|x)?(-?[0-8])(?![0-9A-Za-z#])/g;

/** « Bb3 » → 58. Renvoie null si la chaîne n'est pas une note avec octave. */
export function parsePitch(s: string): number | null {
  const m = /^([A-G](?:#{1,2}|b{1,2}|x)?)(-?[0-8])$/.exec(s.trim());
  if (!m) return null;
  return toMidi(parseNote(m[1]), Number(m[2]));
}

/** Extrait toutes les notes avec octave d'un texte, dans l'ordre (doublons conservés). */
export function extractPitches(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(NOTE_RE)) {
    const midi = toMidi(parseNote(m[1] + (m[2] ?? '')), Number(m[3]));
    if (midi >= 21 && midi <= 108) out.push(midi);
  }
  return out;
}

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/** 61 → « C#4 » (ou « Db4 » avec preferFlats). */
export function midiName(m: number, preferFlats = false): string {
  const names = preferFlats ? FLAT_NAMES : SHARP_NAMES;
  return `${names[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
}

export const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
export const hzToMidi = (hz: number) => 69 + 12 * Math.log2(hz / 440);
