import { describe, it, expect } from 'vitest';
import { moduleStats, unlockedModules } from './unlock';

const items = [
  { id: 'a', module: 'M1' }, { id: 'b', module: 'M1' }, { id: 'c', module: 'M1' },
  { id: 'd', module: 'M2' }, { id: 'e', module: 'M10' }, { id: 't', module: 'Transversal' },
];

describe('déblocage', () => {
  it('trie numériquement et ignore le transversal', () => {
    expect(moduleStats(items, new Set()).map((s) => s.module)).toEqual(['M1', 'M2', 'M10']);
  });
  it('M1 ouvert ; M2 s’ouvre à 70 % de M1', () => {
    expect([...unlockedModules(moduleStats(items, new Set(['a'])))]).toEqual(['M1']);
    expect([...unlockedModules(moduleStats(items, new Set(['a', 'b', 'c'])))]).toEqual(['M1', 'M2']);
  });
  it('pas de saut : M10 reste fermé si M2 ne l’est pas', () => {
    expect(unlockedModules(moduleStats(items, new Set(['a', 'b', 'c']))).has('M10')).toBe(false);
  });
});
