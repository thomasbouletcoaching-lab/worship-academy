import { describe, it, expect } from 'vitest';
import { loadFiches } from './loader';

describe('loader', () => {
  it('lit une fiche et trie par niveau puis module', () => {
    const fiches = loadFiches({
      '/content/2-enrichir/b.md': '---\nid: b\ntitre: B\nniveau: 2\nmodule: M9\n---\n## 1 · X\nok',
      '/content/1-servir/a.md': '---\nid: a\ntitre: A\nniveau: 1\nmodule: M1\n---\n## 1 · Y\nok',
      '/content/CURRICULUM.md': '# ignoré',
    });
    expect(fiches.map((f) => f.id)).toEqual(['a', 'b']);
    expect(fiches[0].sections[0].title).toBe('1 · Y');
  });
});

import { sectionOf } from './loader';
describe('sections', () => {
  it('déduit la section depuis le préfixe', () => {
    expect(sectionOf('gr-roles')).toBe('Jouer en groupe');
    expect(sectionOf('g-moduler')).toBe('Spontané et modulations');
    expect(sectionOf('v-drop2')).toBe('Voicings et empilement');
  });
  it('toutes les vraies fiches ont une section connue et un module', () => {
    const all = loadFiches();
    expect(all.length).toBeGreaterThan(100);
    for (const f of all) {
      expect(f.section, f.id).not.toBe('Autres');
      expect(f.module, f.id).not.toBe('');
    }
  });
  it('M2 vient avant M10 (tri numérique des modules)', () => {
    const all = loadFiches().filter((f) => f.groupe !== 0);
    const idx = (m: string) => all.findIndex((f) => f.module === m);
    expect(idx('M2')).toBeLessThan(idx('M10'));
  });
});
