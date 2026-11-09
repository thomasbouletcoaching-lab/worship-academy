import { describe, it, expect } from 'vitest';
import { makeQuestion, EarMode } from './questions';
import { seeded } from '../exercises/generators';

const MODES: EarMode[] = ['intervalles', 'accords', 'degres', 'basse', 'progressions', 'modulations'];

describe('questions d’oreille', () => {
  it('chaque mode produit une question valide sur 3 niveaux et 300 tirages', () => {
    const rng = seeded(11);
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion(MODES[i % 6], rng, ((i % 3) + 1) as 1 | 2 | 3);
      expect(q.choices).toContain(q.answer);
      expect(q.hits.length).toBeGreaterThan(0);
      for (const h of q.hits) for (const n of h.notes) { expect(n).toBeGreaterThanOrEqual(28); expect(n).toBeLessThanOrEqual(96); }
    }
  });
  it('degrés : la cadence I–IV–V–I précède l’accord mystère', () => {
    const q = makeQuestion('degres', seeded(3));
    expect(q.hits.length).toBe(5);
  });
});
