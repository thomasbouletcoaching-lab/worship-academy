import { describe, it, expect } from 'vitest';
import { seeded, randomChord, scaleTarget, progressionTarget, PROGRESSIONS, KEYS } from './generators';
import { isWellFormed } from '../../theory/chords';

describe('générateurs d’exercices', () => {
  it('reproductible avec une graine', () => {
    const a = randomChord(2, seeded(42)).label;
    const b = randomChord(2, seeded(42)).label;
    expect(a).toBe(b);
  });
  it('accords toujours bien formés, sur 500 tirages et 3 paliers', () => {
    const rng = seeded(7);
    for (let i = 0; i < 500; i++) {
      const t = randomChord(((i % 3) + 1) as 1 | 2 | 3, rng);
      expect(isWellFormed(t.chord)).toBe(true);
      if (t.bassPc !== undefined) expect(t.pcs).toContain(t.bassPc);
    }
  });
  it('gamme de Ré majeur : D4 E4 F#4 G4 A4 B4 C#5 D5', () => {
    expect(scaleTarget('D')).toEqual([62, 64, 66, 67, 69, 71, 73, 74]);
  });
  it('gamme de G majeur commence en G3', () => {
    expect(scaleTarget('G')[0]).toBe(55);
  });
  it('toutes les progressions se construisent dans les 12 tonalités', () => {
    for (const k of KEYS) for (const p of PROGRESSIONS) {
      const chords = progressionTarget(k, p.bars);
      expect(chords.length).toBe(p.bars.length);
    }
  });
  it('2-5-1 en C : Dm7 G7 Cmaj7', () => {
    expect(progressionTarget('C', ['2m7', '57', '1maj7']).map((c) => c.symbol)).toEqual(['Dm7', 'G7', 'Cmaj7']);
  });
});
