import { describe, it, expect } from 'vitest';
import { buildScale, diatonicTriads, romanFor, MODES } from './scales';
import { parseNote, pc } from './notes';

const ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

describe('gammes dans les 12 tonalités', () => {
  it('chaque gamme majeure utilise sept lettres différentes', () => {
    for (const r of ROOTS) {
      const letters = buildScale(parseNote(r), 'ionian').map((n) => n.letter);
      expect(new Set(letters).size, r).toBe(7);
    }
  });
  it('chaque mode a 7 notes distinctes par classe de hauteur (sauf harmoniques, vérifiées séparément)', () => {
    for (const mode of Object.keys(MODES)) {
      for (const r of ROOTS) {
        const scale = buildScale(parseNote(r), mode);
        expect(scale.length).toBe(7);
        expect(new Set(scale.map(pc)).size, `${r} ${mode}`).toBe(7);
      }
    }
  });
  it('Gb majeur = Gb Ab Bb Cb Db Eb F', () => {
    expect(buildScale(parseNote('Gb')).map((n) => n.letter + (n.acc === -1 ? 'b' : n.acc === 1 ? '#' : ''))).toEqual(['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F']);
  });
  it('triades diatoniques de Do majeur : I ii iii IV V vi vii°', () => {
    const triads = diatonicTriads(parseNote('C'));
    expect(triads.map((c, i) => romanFor(c, i + 1))).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
  });
  it('triades diatoniques de La mineur naturel : i ii° III iv v VI VII', () => {
    const triads = diatonicTriads(parseNote('A'), 'aeolian');
    expect(triads.map((c, i) => romanFor(c, i + 1))).toEqual(['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']);
  });
  it('Eb majeur : Eb, Fm, Gm, Ab, Bb, Cm, Ddim', () => {
    expect(diatonicTriads(parseNote('Eb')).map((c) => c.symbol)).toEqual(['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim']);
  });
});
