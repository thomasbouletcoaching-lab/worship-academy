import { describe, it, expect } from 'vitest';
import { analyzeMix } from './mix';

describe('analyse de mix', () => {
  it('main gauche qui double la basse', () => {
    const f = analyzeMix([36], [48, 55], [64, 67, 72], [76]);
    expect(f.some((x) => x.niveau === 'probleme' && x.message.includes('double la basse'))).toBe(true);
  });
  it('tierce trop grave', () => {
    const f = analyzeMix([], [43, 47], [60, 64], []);
    expect(f.some((x) => x.message.includes('intervalle'))).toBe(true);
  });
  it('piano au-dessus de la voix', () => {
    const f = analyzeMix([36], [], [72, 76, 79], [74]);
    expect(f.some((x) => x.message.includes('au-dessus de la mélodie'))).toBe(true);
  });
  it('bonne répartition', () => {
    const f = analyzeMix([31], [52, 59], [64, 67, 71], [79]);
    expect(f).toEqual([{ niveau: 'ok', message: expect.stringContaining('Bonne répartition') }]);
  });
});

describe('boue', () => {
  it('accord serré en C3 : attention', () => {
    expect(analyzeMix([], [48, 52, 55], [60], []).some((x) => x.message.includes('boueux'))).toBe(true);
  });
});
