// Répertoire de grilles (structures et chiffres uniquement, jamais de paroles).
import { repo } from '../../lib/repository';
import { Chart } from './nashville';

export interface SavedChart extends Chart { id: string; updated: string; }

const KEY = 'wa-grilles';

// Grilles d'exemple originales : progressions courantes, sans lien avec un chant protégé.
export const EXAMPLES: SavedChart[] = [
  {
    id: 'ex-ballade', title: 'Exemple · ballade d’adoration', key: 'D', bpm: 68, updated: '',
    sections: [
      { name: 'Intro', bars: ['1', '4/1', '1', '4/1'] },
      { name: 'Couplet', bars: ['1', '5/7', '6m', '4', '1', '5/7', '4', '4'] },
      { name: 'Refrain', bars: ['4', '1/3', '5', '6m', '4', '1/3', '5', '5'] },
      { name: 'Pont', bars: ['6m', '5/7', '1/3', '4', '6m', '5/7', '4', '5sus'] },
      { name: 'Tag', bars: ['4', '5', '1', '1'] },
    ],
  },
  {
    id: 'ex-louange', title: 'Exemple · louange enjouée', key: 'G', bpm: 118, updated: '',
    sections: [
      { name: 'Intro', bars: ['1', '5', '6m', '4'] },
      { name: 'Couplet', bars: ['1', '5', '6m', '4', '1', '5', '4', '4'] },
      { name: 'Pré-refrain', bars: ['2m', '4', '2m', '5sus 5'] },
      { name: 'Refrain', bars: ['1', '5', '6m', '4', '1', '5', '4', '4'] },
      { name: 'Fin', bars: ['4', '5', '1', '1'] },
    ],
  },
  {
    id: 'ex-gospel', title: 'Exemple · gospel (2-5-1 et walk-up)', key: 'Eb', bpm: 76, updated: '',
    sections: [
      { name: 'Couplet', bars: ['1maj7', '3m7 6m7', '2m7', '57'], },
      { name: 'Refrain', bars: ['4maj7', '3m7 6m7', '2m7 57', '1 1/3'], },
      { name: 'Vamp', bars: ['4', '1/3', '2m7', '5sus 57'] },
    ],
  },
];

export function getCharts(): SavedChart[] {
  const saved = repo().get<SavedChart[]>(KEY, []);
  return saved.length ? saved : EXAMPLES;
}
export function saveCharts(list: SavedChart[]) {
  repo().set(KEY, list);
}
export function newChart(): SavedChart {
  return {
    id: `g-${Date.now().toString(36)}`, title: 'Nouvelle grille', key: 'C', bpm: 72, updated: new Date().toISOString(),
    sections: [{ name: 'Couplet', bars: ['1', '5', '6m', '4'] }, { name: 'Refrain', bars: ['4', '1', '5', '6m'] }],
  };
}

/** Partage d'une grille sous forme de code texte. */
export const encodeChart = (c: Chart) => btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, c }))));
export function decodeChart(code: string): Chart | null {
  try {
    const p = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    return p?.v === 1 && Array.isArray(p.c?.sections) ? (p.c as Chart) : null;
  } catch {
    return null;
  }
}
