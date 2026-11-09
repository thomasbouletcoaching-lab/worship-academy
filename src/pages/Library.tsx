import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fiches, GROUPES } from '../content';
import { getValides } from '../lib/progress';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Library() {
  const [q, setQ] = useState('');
  const [groupe, setGroupe] = useState<number | 'tous'>('tous');
  const [section, setSection] = useState('toutes');
  const valides = useMemo(() => new Set(getValides()), []);
  const sections = useMemo(() => [...new Set(fiches.filter((f) => groupe === 'tous' || f.groupe === groupe).map((f) => f.section))], [groupe]);

  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return fiches.filter((f) =>
      (groupe === 'tous' || f.groupe === groupe) &&
      (section === 'toutes' || f.section === section) &&
      words.every((w) => norm(`${f.titre} ${f.id} ${f.section} ${f.module} ${f.categorie}`).includes(w) || norm(f.body).includes(w)),
    );
  }, [q, groupe, section]);

  return (
    <section className="space-y-5">
      <h1 className="font-serif text-2xl font-semibold">Bibliothèque</h1>
      <p className="text-sm opacity-80">{fiches.length} fiches, en accès libre. Cherche un mot (« drop 2 », « cène », « Leslie »…) ou filtre par niveau et par section.</p>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher dans toutes les fiches…" aria-label="Rechercher"
        className="w-full rounded-xl border border-black/15 bg-transparent px-4 py-3 text-base dark:border-white/20" />
      <div className="flex flex-wrap gap-2 text-sm">
        {(['tous', 1, 2, 3, 0] as const).map((g) => (
          <button key={String(g)} type="button" onClick={() => { setGroupe(g); setSection('toutes'); }}
            className={`rounded-full border px-3 py-1.5 ${groupe === g ? 'border-or bg-or/20 font-semibold' : 'border-black/10 dark:border-white/10'}`}>
            {g === 'tous' ? 'Tous' : GROUPES.find((x) => x.n === g)!.court}
          </button>
        ))}
        <select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Section"
          className="rounded-full border border-black/10 bg-transparent px-3 py-1.5 dark:border-white/10 dark:bg-nuit">
          <option value="toutes">Toutes les sections</option>
          {sections.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <p className="text-xs opacity-60">{list.length} résultat(s)</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((f) => (
          <li key={f.id}>
            <Link to={`/fiche/${f.id}`} className="flex h-full items-start gap-3 rounded-xl border border-black/10 p-3 hover:border-or dark:border-white/10">
              <span aria-hidden className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${valides.has(f.id) ? 'bg-sauge' : 'bg-black/15 dark:bg-white/20'}`} />
              <span>
                <span className="block text-xs opacity-60">{f.module} · {f.section} · {Math.max(5, Math.round(f.mots / 180))} min</span>
                <span className="font-medium">{f.titre}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
