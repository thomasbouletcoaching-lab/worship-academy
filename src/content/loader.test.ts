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
