// Charge toutes les fiches de content/ au build (import.meta.glob) et les expose triées.
import { parseFrontmatter, splitSections, FrontValue } from './frontmatter';

export interface Fiche {
  id: string;
  titre: string;
  niveau: number;
  niveauNom: string;
  categorie: string;
  module: string;
  ordre: number;
  prerequis: string[];
  liensAvant: string[];
  liensApres: string[];
  duree: number;
  body: string;
  sections: { title: string; content: string }[];
  path: string;
}

const modules = import.meta.glob('/content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const str = (v: FrontValue | undefined, d = '') => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : d);
const num = (v: FrontValue | undefined, d = 0) => (typeof v === 'number' ? v : d);
const arr = (v: FrontValue | undefined) => (Array.isArray(v) ? v : []);

export function loadFiches(source: Record<string, string> = modules): Fiche[] {
  const out: Fiche[] = [];
  for (const [path, raw] of Object.entries(source)) {
    if (/\/(CURRICULUM|FORMAT|_index)\.md$/.test(path)) continue;
    const { meta, body } = parseFrontmatter(raw);
    const id = str(meta.id, path.split('/').pop()!.replace(/\.md$/, ''));
    out.push({
      id,
      titre: str(meta.titre, id),
      niveau: num(meta.niveau, 1),
      niveauNom: str(meta.niveau_nom, ''),
      categorie: str(meta.categorie, ''),
      module: str(meta.module, ''),
      ordre: num(meta.ordre, 0),
      prerequis: arr(meta.prerequis),
      liensAvant: arr(meta.liens_avant),
      liensApres: arr(meta.liens_apres),
      duree: num(meta.duree_min, 0),
      body,
      sections: splitSections(body),
      path,
    });
  }
  return out.sort((a, b) => a.niveau - b.niveau || a.module.localeCompare(b.module) || a.ordre - b.ordre || a.id.localeCompare(b.id));
}
