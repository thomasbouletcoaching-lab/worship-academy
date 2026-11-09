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

describe('boutons clavier', () => {
  it('ajoute un bouton aux lignes avec au moins deux notes', () => {
    const html = renderMarkdown('- Cmaj7 drop 2 : G3 C4 E4 B4\n- Rien ici', { pitchButtons: true });
    expect(html).toContain('data-midis="55,60,64,71"');
    expect(html.match(/class="kb"/g)?.length).toBe(1);
  });
  it('ligne de tableau : prend les notes de toute la ligne (hors 1re colonne)', () => {
    const html = renderMarkdown('| Accord | MG | MD |\n|---|---|---|\n| Cmaj7 | C3 G3 | E4 B4 |', { pitchButtons: true });
    expect(html).toContain('data-midis="48,55,64,71"');
  });
  it('sans option, aucun bouton', () => {
    expect(renderMarkdown('C4 E4 G4')).not.toContain('kb');
  });
});
