import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadFiches } from '../../content/loader';
import { readJSON, writeJSON } from '../../lib/storage';

const KEY = 'wa-valide';
const fiches = loadFiches();

const NIVEAUX = [
  { n: 1, nom: 'Niveau 1 · Servir (M1–M6)' },
  { n: 2, nom: 'Niveau 2 · Enrichir (M7–M12)' },
  { n: 3, nom: 'Niveau 3 · Maîtriser (M13–M18)' },
];

export default function ParcoursPage() {
  const [valides, setValides] = useState<string[]>(() => readJSON<string[]>(KEY, []));
  const toggle = (id: string) => {
    setValides((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeJSON(KEY, next);
      return next;
    });
  };
  const total = fiches.length;
  const done = useMemo(() => fiches.filter((f) => valides.includes(f.id)).length, [valides]);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Mon parcours</h1>
        <p className="mt-1 text-sm opacity-80">{done} / {total} fiches validées. Coche une fiche quand tu peux la jouer dans les paliers demandés.</p>
        <progress className="mt-3 w-full" value={done} max={Math.max(total, 1)} />
      </div>
      {NIVEAUX.map((niv) => {
        const items = fiches.filter((f) => f.niveau === niv.n);
        if (!items.length) return null;
        return (
          <div key={niv.n} className="space-y-3">
            <h2 className="text-lg font-semibold text-or">{niv.nom}</h2>
            <ul className="space-y-2">
              {items.map((f) => (
                <li key={f.id} className="flex items-start gap-3 rounded-lg border border-black/10 p-3 dark:border-white/10">
                  <input type="checkbox" className="mt-1" checked={valides.includes(f.id)} onChange={() => toggle(f.id)} aria-label={`Valider ${f.titre}`} />
                  <div>
                    <p className="text-xs opacity-60">{f.module} · {f.duree ? `${f.duree} min` : f.categorie}</p>
                    <Link to={`/fiche/${f.id}`} className="font-medium hover:text-or">{f.titre}</Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {fiches.length === 0 && <p className="opacity-70">Le parcours se remplit au fil des fiches.</p>}
    </section>
  );
}
