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
  /** Section du sommaire (docs/CURRICULUM.md), déduite du préfixe de l'id. */
  section: string;
  /** 1, 2, 3, ou 0 pour le transversal (déduit du dossier). */
  groupe: number;
  /** Nombre de mots du corps (pour la durée de lecture). */
  mots: number;
}

/** Préfixe d'id → section du sommaire. L'ordre compte : « gr- » avant « g- ». */
export const SECTIONS: [string, string][] = [
  ['gr-', 'Jouer en groupe'],
  ['sn-', 'Sons et effets'],
  ['mt-', 'Matériel'],
  ['sp-', 'Spirituel et pastoral'],
  ['b-', 'Bases'],
  ['a-', 'Application'],
  ['m-', 'Morceaux'],
  ['l-', 'Louange de base'],
  ['e-', 'Tension et expressivité'],
  ['c-', 'Accords à 4 sons'],
  ['v-', 'Voicings et empilement'],
  ['p-', 'Progressions et fills'],
  ['r-', 'Rythme'],
  ['o-', 'Oreille'],
  ['h-', 'Harmonie louange'],
  ['x-', 'Modes et couleurs'],
  ['s-', 'Dominantes et substitutions'],
  ['y-', 'Réharmonisation'],
  ['g-', 'Spontané et modulations'],
  ['t-', 'Conduire, transcrire, transmettre'],
];
export const sectionOf = (id: string) => SECTIONS.find(([p]) => id.startsWith(p))?.[1] ?? 'Autres';

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
      section: sectionOf(id),
      groupe: path.includes('/transversal/') ? 0 : num(meta.niveau, 1),
      mots: body.split(/\s+/).filter(Boolean).length,
    });
  }
  const g = (x: Fiche) => (x.groupe === 0 ? 9 : x.groupe);
  const modNum = (m: string) => (/^M(\d+)/.exec(m) ? Number(/^M(\d+)/.exec(m)![1]) : 99);
  return out.sort((a, b) => g(a) - g(b) || modNum(a.module) - modNum(b.module) || a.section.localeCompare(b.section) || a.ordre - b.ordre || a.id.localeCompare(b.id));
}
