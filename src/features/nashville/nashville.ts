// Grilles en Nashville Number System : chiffres (1..7) → accords, transposition instantanée.
// Aucune parole : uniquement des grilles et des structures.
import { parseNote } from '../../theory/notes';
import { buildChord, Chord, QUALITIES } from '../../theory/chords';
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
  // Degré altéré : b3, b6, b7 = accords majeurs empruntés ; #4 (et autres dièses) = diminué de passage.
  if (alter === -1) quality = 'maj';
  if (alter === 1) quality = 'dim';
  const rest = suffix.trim();
  if (rest === '') return buildChord(root, quality);
  if (rest === 'm' || rest === '-') return buildChord(root, 'min');
  if (rest === '7') return buildChord(root, quality === 'min' ? 'm7' : quality === 'dim' ? 'm7b5' : '7');
  if (rest === 'sus') return buildChord(root, 'sus4');
  if (rest === '°' || rest === 'o') return buildChord(root, 'dim');
  if (rest === 'ø' || rest === 'ø7') return buildChord(root, 'm7b5');
  if (rest === 'M7' || rest === 'Δ' || rest === 'Δ7') return buildChord(root, 'maj7');
  if (QUALITIES[rest]) return buildChord(root, rest);
  throw new Error(`Suffixe non reconnu : « ${token} »`);
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

/** Accord d'une grille, avec basse éventuelle (accord slash : « 1/3 » = I avec la tierce à la basse). */
export interface ChartChord { chord: Chord; bass?: Note; symbol: string; }

const noteStr = (n: Note) => `${n.letter}${n.acc === 1 ? '#' : n.acc === -1 ? 'b' : n.acc === 2 ? '##' : n.acc === -2 ? 'bb' : ''}`;

export function tokenToChartChord(key: string, token: string): ChartChord {
  const { tonic, mode } = parseKey(key);
  const [main, bassTok] = token.split('/');
  const chord = degreeToChord(tonic, mode, main);
  if (!bassTok) return { chord, symbol: chord.symbol };
  const b = degreeToChord(tonic, mode, bassTok.replace(/[^#b1-7]/g, '')).root;
  return { chord, bass: b, symbol: `${chord.symbol}/${noteStr(b)}` };
}

export function barToChartChords(key: string, bar: string): ChartChord[] {
  return bar.trim().split(/\s+/).filter(Boolean).filter((t) => t !== '%').map((t) => tokenToChartChord(key, t));
}

/** Découpe le texte d'une section en mesures : séparateurs « | » ou retours à la ligne. « % » répète la mesure précédente. */
export function parseBars(text: string): string[] {
  const raw = text.split(/[|\n]/).map((b) => b.trim()).filter(Boolean);
  const out: string[] = [];
  for (const b of raw) out.push(b === '%' && out.length ? out[out.length - 1] : b);
  return out;
}

/** Erreurs d'une grille (une par mesure fautive), en français. */
export function chartErrors(chart: Chart): string[] {
  const errs: string[] = [];
  try { parseKey(chart.key); } catch { errs.push(`Tonalité inconnue : « ${chart.key} »`); return errs; }
  chart.sections.forEach((s) => s.bars.forEach((b, i) => {
    try { barToChartChords(chart.key, b); } catch (e) { errs.push(`${s.name}, mesure ${i + 1} : ${(e as Error).message}`); }
  }));
  return errs;
}

/** Rendu en symboles avec accords slash. */
export function renderChartSymbols(chart: Chart): { section: string; bars: string[][] }[] {
  return chart.sections.map((s) => ({ section: s.name, bars: s.bars.map((b) => { try { return barToChartChords(chart.key, b).map((c) => c.symbol); } catch { return ['?']; } }) }));
}
