import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fiches, ficheById, GROUPES } from '../content';
import { getValides, getCards, isFragile, getLog, streak, getEar, getExercises } from '../lib/progress';

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm"><span>{label}</span><span className="tabular-nums opacity-70">{value}/{max} · {pct} %</span></div>
      <div className="mt-1 h-2.5 rounded-full bg-black/10 dark:bg-white/10"><div className="h-2.5 rounded-full bg-or" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function Progres() {
  const d = useMemo(() => {
    const valides = new Set(getValides());
    const log = getLog();
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const dt = new Date(); dt.setDate(dt.getDate() - (13 - i));
      const day = dt.toISOString().slice(0, 10);
      return { day, n: log.filter((l) => l.date === day).length };
    });
    const ear = getEar();
    const earCats = Object.entries(ear).filter(([k]) => !k.includes(':'));
    const earWeak = Object.entries(ear).filter(([k, v]) => k.includes(':') && v.total >= 3 && v.ok / v.total < 0.6);
    const ex = getExercises();
    const withTiming = ex.filter((e) => e.ecartMs !== null);
    return {
      valides, last14, earCats, earWeak,
      fragiles: Object.values(getCards()).filter(isFragile),
      serie: streak(log),
      ex: ex.length, exOk: ex.filter((e) => e.reussi).length,
      ecart: withTiming.length ? Math.round(withTiming.slice(-20).reduce((a, e) => a + (e.ecartMs ?? 0), 0) / Math.min(20, withTiming.length)) : null,
    };
  }, []);
  const maxDay = Math.max(1, ...d.last14.map((x) => x.n));

  return (
    <section className="space-y-8">
      <h1 className="font-serif text-2xl font-semibold">Progrès</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        {[['Série', `${d.serie} j`], ['Fiches validées', String(d.valides.size)], ['Exercices réussis', `${d.exOk}/${d.ex}`], ['Écart rythmique récent', d.ecart === null ? '—' : `${d.ecart} ms`]].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-black/10 p-4 dark:border-white/10"><p className="text-xs uppercase opacity-60">{k}</p><p className="text-2xl font-semibold tabular-nums">{v}</p></div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Par niveau</h2>
        {GROUPES.map((g) => {
          const items = fiches.filter((f) => f.groupe === g.n);
          return <Bar key={g.n} label={g.nom} value={items.filter((f) => d.valides.has(f.id)).length} max={items.length} />;
        })}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Activité des 14 derniers jours</h2>
        <div className="flex h-24 items-end gap-1" role="img" aria-label="Activité par jour">
          {d.last14.map((x) => (
            <div key={x.day} className="flex-1 rounded-t bg-or/80" style={{ height: `${(x.n / maxDay) * 100}%`, minHeight: x.n ? 4 : 1 }} title={`${x.day} : ${x.n} activité(s)`} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Oreille</h2>
        {d.earCats.length === 0 && <p className="text-sm opacity-70">Pas encore de réponses. <Link to="/oreille" className="text-or underline">Commencer</Link></p>}
        {d.earCats.map(([k, v]) => <Bar key={k} label={k} value={v.ok} max={v.total} />)}
        {d.earWeak.length > 0 && <p className="text-sm">À retravailler : {d.earWeak.map(([k]) => k.split(':')[1]).join(', ')}.</p>}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Notions fragiles</h2>
        {d.fragiles.length === 0 ? <p className="text-sm opacity-70">Aucune pour l’instant.</p> : (
          <ul className="flex flex-wrap gap-2">{d.fragiles.map((c) => <li key={c.id}><Link to={`/fiche/${c.id}`} className="inline-block rounded-full border border-bordeaux px-3 py-1.5 text-sm">{ficheById.get(c.id)?.titre ?? c.id}</Link></li>)}</ul>
        )}
      </div>
    </section>
  );
}
