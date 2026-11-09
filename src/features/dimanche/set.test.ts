import { describe, it, expect } from 'vitest';
import { encodeSet, decodeSet, weekPlan } from './set';

describe('set du dimanche', () => {
  const set = { date: '2026-11-15', chants: [{ titre: 'Ouverture', tonalite: 'G', bpm: 110 }, { titre: 'Adoration', tonalite: 'D', bpm: 68 }] };
  it('code de partage aller-retour', () => {
    expect(decodeSet(encodeSet(set))?.chants[1].titre).toBe('Adoration');
    expect(decodeSet('zzz')).toBeNull();
  });
  it('plan sur 7 jours avec tempo et transitions', () => {
    const p = weekPlan(set);
    expect(p).toHaveLength(7);
    expect(p[3].focus).toContain('110 BPM');
    expect(p[4].focus).toContain('Ouverture → Adoration');
  });
});
