import { describe, it, expect } from 'vitest';
import { parseFrontmatter, splitSections } from './frontmatter';

const sample = `---
id: v-drop2
titre: Drop 2
niveau: 2
prerequis: [c-maj7, v-shells]
emotions: []
---
> **Niveau** : 2

## 1 · L'idée
Phrase.

## 2 · Comprendre
Texte.
`;

describe('frontmatter', () => {
  it('lit scalaires, nombres et tableaux', () => {
    const { meta } = parseFrontmatter(sample);
    expect(meta.id).toBe('v-drop2');
    expect(meta.niveau).toBe(2);
    expect(meta.prerequis).toEqual(['c-maj7', 'v-shells']);
    expect(meta.emotions).toEqual([]);
  });
  it('découpe les sections', () => {
    const { body } = parseFrontmatter(sample);
    const sec = splitSections(body);
    expect(sec.map((s) => s.title)).toContain("1 · L'idée");
    expect(sec.find((s) => s.title === '2 · Comprendre')?.content).toBe('Texte.');
  });
});
