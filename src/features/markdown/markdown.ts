// Rendu Markdown minimal et sûr pour les fiches (titres, listes, tableaux, callouts, gras, code).
// Option `pitchButtons` : ajoute un bouton 🎹 aux lignes qui contiennent au moins deux notes avec octave.
import { extractPitches } from '../../theory/pitch';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inline(s: string): string {
  let out = esc(s);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

const isTableSep = (l: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l);
const splitRow = (l: string) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

export interface RenderOptions { pitchButtons?: boolean; }

/** Bouton clavier pour une ligne de texte brut (vide si moins de deux notes). */
export function pitchButton(raw: string): string {
  const midis = [...new Set(extractPitches(raw))];
  if (midis.length < 2) return '';
  return `<button type="button" class="kb" data-midis="${midis.join(',')}" aria-label="Voir sur le clavier et écouter">🎹</button>`;
}

export function renderMarkdown(src: string, opts: RenderOptions = {}): string {
  const kb = (raw: string) => (opts.pitchButtons ? pitchButton(raw) : '');
  const lines = src.split(/\r?\n/);
  const html: string[] = [];
  let i = 0;
  const para: string[] = [];
  const flush = () => {
    if (para.length) {
      html.push(`<p>${inline(para.join(' '))}${kb(para.join(' '))}</p>`);
      para.length = 0;
    }
  };
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { flush(); i++; continue; }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) { flush(); html.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`); i++; continue; }
    if (/^---+\s*$/.test(line)) { flush(); html.push('<hr/>'); i++; continue; }
    if (/^>\s?/.test(line)) {
      flush();
      const block: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { block.push(lines[i].replace(/^>\s?/, '')); i++; }
      html.push(`<blockquote>${inline(block.join(' '))}</blockquote>`);
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      flush();
      const head = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
      html.push(
        '<div class="table-wrap"><table><thead><tr>' +
          head.map((c) => `<th>${inline(c)}</th>`).join('') +
          '</tr></thead><tbody>' +
          rows.map((r) => '<tr>' + r.map((c, j) => `<td>${inline(c)}${j === 0 ? kb(r.slice(1).join(' ') || c) : ''}</td>`).join('') + '</tr>').join('') +
          '</tbody></table></div>',
      );
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      html.push('<ul>' + items.map((x) => `<li>${inline(x)}${kb(x)}</li>`).join('') + '</ul>');
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      html.push('<ol>' + items.map((x) => `<li>${inline(x)}${kb(x)}</li>`).join('') + '</ol>');
      continue;
    }
    para.push(line.trim());
    i++;
  }
  flush();
  return html.join('\n');
}
