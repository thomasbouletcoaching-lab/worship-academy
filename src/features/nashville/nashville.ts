// Grilles en Nashville Number System : chiffres (1..7) → accords, transposition instantanée.
// Aucune parole : uniquement des grilles et des structures.
import { parseNote } from '../../theory/notes';
import { buildChord, Chord } from '../../theory/chords';
import { buildScale, MODES } from '../../theory/scales';
import { pc, Note } from '../../theory/notes';

export interface Section {
  name: string;
  bars: string[]; // chaque mesure = chaîne de chiffres, ex. "1 6m" ou "4 5"
}

export interface Chart {
  title: string;
  key: string; // ex. "G" ou "Am"
  bpm: number;
  sections: Section[];
}

/** Degré + suffixe → accord dans la tonalité (majeure ou mineure naturelle). */
export function degreeToChord(tonic: Note, mode: string, token: string): Chord {
  const m = /^([#b]?)([1-7])(.*)$/.exec(token.trim());
  if (!m) throw new Error(`Chiffre invalide : ${token}`);
  const alter = m[1] === '#' ? 1 : m[1] === 'b' ? -1 : 0;
  const degree = Number(m[2]);
  const suffix = m[3];
  const scale = buildScale(tonic, mode);
  const base = scale[degree - 1];
  const root: Note = alter ? { letter: base.letter, acc: base.acc + alter } : base;
  // Qualité issue de la gamme diatonique (tierce + quinte réelles).
  const a = scale[degree - 1];
  const b = scale[(degree + 1) % 7];
  const c = scale[(degree + 3) % 7];
  const third = (pc(b) - pc(a) + 12) % 12;
  const fifth = (pc(c) - pc(a) + 12) % 12;
  let quality = third === 4 && fifth === 7 ? 'maj' : third === 3 && fifth === 7 ? 'min' : third === 3 && fifth === 6 ? 'dim' : 'maj';
  if (alter) quality = quality; // altérer la fondamentale ne change pas la qualité par défaut
  const rest = suffix.toLowerCase();
  if (rest === '' ) return buildChord(root, quality);
  if (rest === 'm') return buildChord(root, 'min');
  if (rest === '7') return buildChord(root, quality === 'min' ? 'm7' : quality === 'dim' ? 'm7b5' : '7');
  if (rest === 'maj7') return buildChord(root, 'maj7');
  if (rest === 'm7') return buildChord(root, 'm7');
  if (rest === 'sus4') return buildChord(root, 'sus4');
  if (rest === 'add9') return buildChord(root, 'add9');
  if (rest === '9') return buildChord(root, quality === 'min' ? 'm9' : '9');
  if (rest === 'dim') return buildChord(root, 'dim');
  if (rest === 'm7b5') return buildChord(root, 'm7b5');
  throw new Error(`Suffixe non géré : ${token}`);
}

/** Tonique depuis une tonalité « G » ou « Am » (mineur naturel). */
export function parseKey(key: string): { tonic: Note; mode: string } {
  const minor = /m$/.test(key.trim());
  const tonic = parseNote(key.trim().replace(/m$/, ''));
  return { tonic, mode: minor ? 'aeolian' : 'ionian' };
}

/** Mesure → accords (les chiffres séparés par des espaces se partagent la mesure). */
export function barToChords(key: string, bar: string): Chord[] {
  const { tonic, mode } = parseKey(key);
  return bar.trim().split(/\s+/).filter(Boolean).map((t) => degreeToChord(tonic, mode, t));
}

/** Transposition : on change la tonalité, les chiffres ne bougent pas. */
export function transposeChart(chart: Chart, newKey: string): Chart {
  return { ...chart, key: newKey };
}

/** Rendu lisible d'une grille : sections puis mesures avec les symboles d'accords. */
export function renderChart(chart: Chart): { section: string; bars: string[][] }[] {
  return chart.sections.map((s) => ({
    section: s.name,
    bars: s.bars.map((b) => barToChords(chart.key, b).map((c) => c.symbol)),
  }));
}

export { MODES };
