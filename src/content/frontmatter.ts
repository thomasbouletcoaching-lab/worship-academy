// Lecture minimale du frontmatter YAML des fiches (scalaires, booléens, nombres, tableaux inline).
export type FrontValue = string | number | boolean | string[];
export interface Parsed {
  meta: Record<string, FrontValue>;
  body: string;
}

const parseScalar = (raw: string): FrontValue => {
  const v = raw.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((x) => stripQuotes(x.trim()));
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return stripQuotes(v);
};

const stripQuotes = (s: string) => (/^(["']).*\1$/.test(s) ? s.slice(1, -1) : s);

export function parseFrontmatter(src: string): Parsed {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { meta: {}, body: src };
  const meta: Record<string, FrontValue> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0 || line.trim().startsWith('#')) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).replace(/\s+#.*$/, '');
    meta[key] = parseScalar(val);
  }
  return { meta, body: src.slice(m[0].length) };
}

/** Découpe le corps en sections « ## … » (les 9 blocs). */
export function splitSections(body: string): { title: string; content: string }[] {
  const parts = body.split(/^## /m).filter((p) => p.trim().length);
  return parts.map((p) => {
    const nl = p.indexOf('\n');
    return { title: (nl === -1 ? p : p.slice(0, nl)).trim(), content: nl === -1 ? '' : p.slice(nl + 1).trim() };
  });
}
