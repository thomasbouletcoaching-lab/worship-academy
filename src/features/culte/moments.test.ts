import { describe, it, expect } from 'vitest';
import { evaluateMoment, MOMENTS } from './moments';

const priere = MOMENTS.find((m) => m.id === 'priere')!.profil;
const appel = MOMENTS.find((m) => m.id === 'appel')!.profil;

describe('simulateur de culte', () => {
  it('prière : accords doux et rares = tout juste', () => {
    const ev = [0, 5, 10, 15, 20, 25].flatMap((t) => [48, 55, 64].map((n) => ({ note: n, velocity: 40, at: t })));
    expect(evaluateMoment(ev, 30, priere).every((f) => f.ok)).toBe(true); // 18 notes / 30 s = 0,6
  });
  it('prière : arpèges rapides et forts = trop chargé et trop fort', () => {
    const ev = Array.from({ length: 150 }, (_, i) => ({ note: 60 + (i % 12), velocity: 100, at: i / 5 }));
    const f = evaluateMoment(ev, 30, priere);
    expect(f.filter((x) => !x.ok).length).toBeGreaterThanOrEqual(2);
  });
  it('appel : détecte le crescendo', () => {
    const ev = Array.from({ length: 60 }, (_, i) => ({ note: 60, velocity: 40 + i, at: i / 2 }));
    expect(evaluateMoment(ev, 30, appel).some((f) => f.ok && f.message.includes('Crescendo'))).toBe(true);
  });
  it('rien joué', () => {
    expect(evaluateMoment([], 30, priere)[0].ok).toBe(false);
  });
});
