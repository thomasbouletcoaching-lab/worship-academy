// Vérifie chaque fiche de content/ contre docs/FORMAT.md.
// Usage : npm run content:check  (code de sortie 1 si erreur bloquante)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parseFrontmatter, splitSections } from '../src/content/frontmatter';

const ROOT = join(process.cwd(), 'content');
const REQUIRED_META = ['id', 'titre', 'niveau', 'module', 'categorie'];
const SECTION_PREFIXES = ['1 ·', '2 ·', '3 ·', '4 ·', '5 ·', '6 ·', '7 ·', '8 ·', '9 ·'];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

let errors = 0;
let warnings = 0;
const files = walk(ROOT).filter((f) => !/\/(CURRICULUM|FORMAT|_index)\.md$/.test(f));
const ids = new Set<string>();

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const name = basename(file);
  const { meta, body } = parseFrontmatter(raw);
  const err = (m: string) => { errors++; console.error(`ERREUR ${file} : ${m}`); };
  const warn = (m: string) => { warnings++; console.warn(`attention ${file} : ${m}`); };

  if (!raw.startsWith('---')) err('frontmatter absent');
  for (const k of REQUIRED_META) if (meta[k] === undefined || meta[k] === '') err(`champ « ${k} » manquant`);
  if (meta.id && `${meta.id}.md` !== name) err(`id « ${meta.id} » ne correspond pas au nom de fichier`);
  if (meta.id) {
    if (ids.has(String(meta.id))) err(`id dupliqué « ${meta.id} »`);
    ids.add(String(meta.id));
  }
  const titles = splitSections(body).map((s) => s.title);
  const found = SECTION_PREFIXES.map((p) => titles.some((t) => t.startsWith(p)));
  found.forEach((ok, i) => { if (!ok) err(`bloc « ${SECTION_PREFIXES[i]} » manquant`); });
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 900) warn(`fiche courte (${words} mots, cible 1 200 à 2 000)`);
  if (/\bpartition\b.*\bfournie\b/i.test(body)) warn('mention de partition fournie à vérifier');
}

console.log(`${files.length} fiche(s) vérifiée(s), ${errors} erreur(s), ${warnings} avertissement(s).`);
process.exit(errors > 0 ? 1 : 0);
