import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fiches, GROUPES } from '../content';
import { getValides, setValide } from '../lib/progress';
import { moduleStats, unlockedModules, UNLOCK_RATIO } from '../lib/unlock';

const MODULE_TITRES: Record<string, string> = {
  M1: 'Se repérer', M2: 'Gamme et application', M3: 'Jouer des morceaux', M4: 'Les deux mains', M5: 'Accompagner', M6: 'Servir seul',
  M7: 'Tension et expressivité', M8: 'Accords à 4 sons', M9: 'Voicings et empilement', M10: 'Progressions et fills', M11: 'Rythme et oreille', M12: 'Harmonie louange',
  M13: 'Modes et couleurs', M14: 'Dominantes et substitutions', M15: 'Réharmonisation', M16: 'Spontané et modulations', M17: 'Jouer en groupe', M18: 'Conduire et transmettre',
};

export default function Parcours() {
  const [valides, setValides] = useState(() => new Set(getValides()));
  const [libre, setLibre] = useState(false);
  const stats = useMemo(() => moduleStats(fiches, valides), [valides]);
  const open = useMemo(() => unlockedModules(stats), [stats]);
  const total = fiches.length;
  const done = fiches.filter((f) => valides.has(f.id)).length;

  const toggle = (id: string) => {
    const v = !valides.has(id);
    setValide(id, v);
    setValides(new Set(getValides()));
  };

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold">Mon parcours</h1>
        <p className="text-sm opacity-80">
          {done} / {total} fiches validées. Un module s’ouvre quand {Math.round(UNLOCK_RATIO * 100)} % du module précédent est validé.
          La bibliothèque reste en accès libre.
        </p>
        <progress className="w-full accent-[#c9a24a]" value={done} max={Math.max(total, 1)} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={libre} onChange={(e) => setLibre(e.target.checked)} /> Mode confirmé : tout ouvrir</label>
      </div>
      {GROUPES.filter((g) => g.n !== 0).map((g) => (
        <div key={g.n} className="space-y-4">
          <h2 className="text-lg font-semibold text-or">{g.nom} <span className="text-sm font-normal opacity-70">({g.modules})</span></h2>
          {stats.filter((s) => fiches.find((f) => f.module === s.module)?.groupe === g.n).map((s) => {
            const isOpen = libre || open.has(s.module);
            const items = fiches.filter((f) => f.module === s.module);
            return (
              <details key={s.module} open={isOpen && s.valides < s.total} className={`rounded-xl border p-3 ${isOpen ? 'border-black/10 dark:border-white/10' : 'border-dashed border-black/10 opacity-60 dark:border-white/10'}`}>
                <summary className="flex cursor-pointer items-center gap-3">
                  <span className="text-lg">{isOpen ? (s.valides === s.total ? '✅' : '📖') : '🔒'}</span>
                  <span className="font-semibold">{s.module} · {MODULE_TITRES[s.module] ?? ''}</span>
                  <span className="ml-auto text-sm tabular-nums opacity-70">{s.valides}/{s.total}</span>
                </summary>
                {!isOpen && <p className="mt-2 text-sm">Valide {Math.ceil(UNLOCK_RATIO * 100)} % du module précédent pour l’ouvrir (ou consulte ses fiches dans la bibliothèque).</p>}
                {isOpen && (
                  <ul className="mt-3 space-y-2">
                    {items.map((f) => (
                      <li key={f.id} className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1 h-5 w-5" checked={valides.has(f.id)} onChange={() => toggle(f.id)} aria-label={`Valider ${f.titre}`} />
                        <Link to={`/fiche/${f.id}`} className="hover:text-or">{f.titre}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            );
          })}
        </div>
      ))}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-or">Transversal</h2>
        <p className="text-sm opacity-80">Sons, matériel et dimension spirituelle : à lire à tout moment.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {fiches.filter((f) => f.groupe === 0).map((f) => (
            <li key={f.id} className="flex items-start gap-3 rounded-xl border border-black/10 p-3 dark:border-white/10">
              <input type="checkbox" className="mt-1 h-5 w-5" checked={valides.has(f.id)} onChange={() => toggle(f.id)} aria-label={`Valider ${f.titre}`} />
              <Link to={`/fiche/${f.id}`} className="hover:text-or">{f.titre}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
