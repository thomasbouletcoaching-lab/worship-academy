// Générateurs de questions d'oreille. Chaque question fournit des « pistes » à jouer et les choix possibles.
import { Rng, pick, KEYS } from '../exercises/generators';
import { parseNote, toMidi, pc } from '../../theory/notes';
import { buildChord, closeVoicing } from '../../theory/chords';
import { barToChartChords } from '../nashville/nashville';
import { voiceLead } from '../../theory/voiceLeading';

export type EarMode = 'intervalles' | 'accords' | 'degres' | 'basse' | 'progressions' | 'modulations';

/** Une piste = des notes jouées ensemble à un instant (secondes depuis le début), avec une durée. */
export interface Hit { at: number; notes: number[]; dur: number; }
export interface Question { mode: EarMode; hits: Hit[]; choices: string[]; answer: string; explication: string; }

export const INTERVALS: [number, string, string][] = [
  [1, 'Seconde mineure', 'frottement, tension maximale'],
  [2, 'Seconde majeure', 'un pas de gamme'],
  [3, 'Tierce mineure', 'couleur douce, mélancolique'],
  [4, 'Tierce majeure', 'lumineux, joyeux'],
  [5, 'Quarte juste', 'ouvert, appel, « amen » plagal'],
  [6, 'Triton', 'instable, demande à résoudre'],
  [7, 'Quinte juste', 'stable, creux, puissant'],
  [8, 'Sixte mineure', 'nostalgique'],
  [9, 'Sixte majeure', 'chaleureux, ouvert'],
  [10, 'Septième mineure', 'attente, couleur de dominante'],
  [11, 'Septième majeure', 'tension douce, rêveuse'],
  [12, 'Octave', 'même note, plus haut'],
];
export const CHORD_QUALITIES: [string, string][] = [
  ['maj', 'Majeur'], ['min', 'Mineur'], ['dim', 'Diminué'], ['aug', 'Augmenté'], ['sus4', 'Sus4'],
  ['maj7', 'Majeur 7'], ['m7', 'Mineur 7'], ['7', 'Dominante 7'], ['m7b5', 'Demi-diminué'],
];
const DEGREE_TOKENS = ['1', '2m', '3m', '4', '5', '6m'];
export const PROGRESSIONS: [string, string[]][] = [
  ['1 – 5 – 6m – 4', ['1', '5', '6m', '4']],
  ['1 – 4 – 5 – 1', ['1', '4', '5', '1']],
  ['6m – 4 – 1 – 5', ['6m', '4', '1', '5']],
  ['1 – 6m – 4 – 5', ['1', '6m', '4', '5']],
  ['2m – 5 – 1 – 1', ['2m', '5', '1', '1']],
  ['4 – 1 – 5 – 6m', ['4', '1', '5', '6m']],
];
export const MODULATIONS: [number, string, string][] = [
  [1, '+½ ton', 'la « modulation camion » du dernier refrain'],
  [2, '+1 ton', 'montée d’énergie franche'],
  [5, 'Une quarte plus haut', 'vers la sous-dominante : naturel, doux'],
  [7, 'Une quinte plus haut', 'vers la dominante : lumineux'],
  [-3, 'Vers le relatif mineur', 'même armure, couleur grave'],
];

const voiced = (key: string, tok: string, prev: number[] = []) => {
  const c = barToChartChords(key, tok)[0].chord;
  return prev.length ? voiceLead(prev, c, 55, 76) : closeVoicing(c.notes, toMidi(c.notes[0], 4));
};
const bassOf = (key: string, tok: string) => {
  const r = barToChartChords(key, tok)[0].chord.root;
  const m = toMidi(r, 2);
  return m < 38 ? m + 12 : m;
};
/** Cadence I – IV – V – I pour installer la tonalité. */
function cadence(key: string, start = 0, beat = 0.7): { hits: Hit[]; end: number } {
  const hits: Hit[] = [];
  let prev: number[] = [];
  ['1', '4', '5', '1'].forEach((t, i) => {
    prev = voiced(key, t, prev);
    hits.push({ at: start + i * beat, notes: [bassOf(key, t), ...prev], dur: beat * 0.95 });
  });
  return { hits, end: start + 4 * beat };
}

export function makeQuestion(mode: EarMode, rng: Rng = Math.random, level: 1 | 2 | 3 = 1): Question {
  switch (mode) {
    case 'intervalles': {
      const pool = level === 1 ? INTERVALS.filter(([s]) => [3, 4, 5, 7, 12].includes(s)) : level === 2 ? INTERVALS.filter(([s]) => s >= 2) : INTERVALS;
      const [s, name, hint] = pick(pool, rng);
      const base = 55 + Math.floor(rng() * 10);
      const harmonic = level === 3 && rng() < 0.5;
      return {
        mode, choices: pool.map((p) => p[1]), answer: name, explication: `${name} (${s} demi-tons) : ${hint}.`,
        hits: harmonic ? [{ at: 0, notes: [base, base + s], dur: 1.4 }] : [{ at: 0, notes: [base], dur: 0.8 }, { at: 0.8, notes: [base + s], dur: 1 }],
      };
    }
    case 'accords': {
      const pool = level === 1 ? CHORD_QUALITIES.slice(0, 2) : level === 2 ? CHORD_QUALITIES.slice(0, 5) : CHORD_QUALITIES;
      const [q, name] = pick(pool, rng);
      const c = buildChord(parseNote(pick(KEYS, rng)), q);
      const notes = closeVoicing(c.notes, toMidi(c.notes[0], 4) > 64 ? toMidi(c.notes[0], 3) : toMidi(c.notes[0], 4));
      return {
        mode, choices: pool.map((p) => p[1]), answer: name, explication: `${name} : ${c.symbol} (${c.notes.map((n) => n.letter + (n.acc === 1 ? '#' : n.acc === -1 ? 'b' : '')).join(' ')}).`,
        hits: [{ at: 0, notes, dur: 1.4 }, { at: 1.6, notes: [], dur: 0 }, ...notes.map((m, i) => ({ at: 1.6 + i * 0.3, notes: [m], dur: 0.6 }))],
      };
    }
    case 'degres': {
      const key = pick(KEYS, rng);
      const pool = level === 1 ? ['1', '4', '5', '6m'] : DEGREE_TOKENS;
      const tok = pick(pool, rng);
      const cad = cadence(key);
      const deg = tok.replace(/\D/g, '');
      return {
        mode, choices: pool.map((t) => t.replace(/\D/g, '')), answer: deg,
        explication: `C’était le ${deg} (${barToChartChords(key, tok)[0].symbol} en ${key}).`,
        hits: [...cad.hits, { at: cad.end + 0.6, notes: [bassOf(key, tok), ...voiced(key, tok)], dur: 1.6 }],
      };
    }
    case 'basse': {
      const key = pick(KEYS, rng);
      const pool = level === 1 ? ['4', '5', '6m'] : ['2m', '3m', '4', '5', '6m'];
      const tok = pick(pool, rng);
      const cad = cadence(key);
      const deg = tok.replace(/\D/g, '');
      const b1 = bassOf(key, '1');
      return {
        mode, choices: pool.map((t) => `1 → ${t.replace(/\D/g, '')}`), answer: `1 → ${deg}`,
        explication: `La basse allait de ${key} vers le degré ${deg}. Écoute la direction et la taille du saut.`,
        hits: [...cad.hits, { at: cad.end + 0.6, notes: [b1], dur: 0.9 }, { at: cad.end + 1.5, notes: [bassOf(key, tok)], dur: 1.2 }],
      };
    }
    case 'progressions': {
      const key = pick(KEYS, rng);
      const pool = level === 1 ? PROGRESSIONS.slice(0, 3) : PROGRESSIONS;
      const [name, toks] = pick(pool, rng);
      let prev: number[] = [];
      const hits = toks.map((t, i) => { prev = voiced(key, t, prev); return { at: i * 1.1, notes: [bassOf(key, t), ...prev], dur: 1.05 }; });
      return { mode, choices: pool.map((p) => p[0]), answer: name, explication: `${name} en ${key} : ${toks.map((t) => barToChartChords(key, t)[0].symbol).join(' – ')}.`, hits };
    }
    case 'modulations': {
      const key = pick(KEYS.filter((k) => !['F#', 'B'].includes(k)), rng);
      const pool = level === 1 ? MODULATIONS.slice(0, 2) : MODULATIONS;
      const [shift, name, hint] = pick(pool, rng);
      const tonic = parseNote(key);
      const p2 = (pc(tonic) + shift + 12) % 12;
      const key2 = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][p2];
      const a = cadence(key, 0, 0.6);
      const b = shift === -3 ? (() => {
        // Relatif mineur : 6m – 2m – 3 – 6m dans la tonalité de départ.
        const toks = ['6m', '2m', '3', '6m'];
        let prev: number[] = [];
        return { hits: toks.map((t, i) => { prev = voiced(key, t, prev); return { at: a.end + 0.4 + i * 0.6, notes: [bassOf(key, t), ...prev], dur: 0.57 }; }) };
      })() : cadence(key2, a.end + 0.4, 0.6);
      return { mode, choices: pool.map((p) => p[1]), answer: name, explication: `${name} : ${hint}.`, hits: [...a.hits, ...b.hits] };
    }
  }
}
