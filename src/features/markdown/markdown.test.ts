import { describe, it, expect } from 'vitest';
import { renderMarkdown, inline } from './markdown';

describe('markdown', () => {
  it('titres et gras', () => {
    expect(renderMarkdown('## 1 · Idée')).toContain('<h3>1 · Idée</h3>');
    expect(inline('**Clé** : `C4`')).toBe('<strong>Clé</strong> : <code>C4</code>');
  });
  it('tableau', () => {
    const html = renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>2</td>');
  });
  it('échappe le HTML', () => {
    expect(inline('<script>x</script>')).not.toContain('<script>');
  });
  it('listes et callouts', () => {
    expect(renderMarkdown('- a\n- b')).toBe('<ul><li>a</li><li>b</li></ul>');
    expect(renderMarkdown('> note')).toBe('<blockquote>note</blockquote>');
  });
});
