import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { fiches, ficheById } from '../content';
import { getValides, getCards, isDue, isFragile, getLog, streak } from '../lib/progress';
import { moduleStats, unlockedModules } from '../lib/unlock';

export default function Home() {
  const data = useMemo(() => {
    const valides = new Set(getValides());
    const cards = Object.values(getCards());
    const dues = cards.filter((c) => isDue(c)).map((c) => ficheById.get(c.id)).filter(Boolean);
    const fragiles = cards.filter(isFragile).map((c) => ficheById.get(c.id)).filter(Boolean);
    const open = unlockedModules(moduleStats(fiches, valides));
    const suivante = fiches.find((f) => f.groupe !== 0 && open.has(f.module) && !valides.has(f.id));
    return { valides, dues, fragiles, suivante, serie: streak(getLog()) };
  }, []);

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-semibold leading-tight">Accompagner la louange au piano, en autonomie.</h1>
        <p className="max-w-2xl leading-relaxed opacity-90">
          Comprendre l’harmonie, s’entraîner au clavier, servir dans l’église. {fiches.length} fiches, des exercices validés au clavier MIDI,
          et des outils pour le dimanche.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl border border-black/10 p-3 dark:border-white/10 sm:p-4">
          <p className="text-[10px] uppercase opacity-60 sm:text-xs">Fiches validées</p>
          <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{data.valides.size}<span className="text-sm opacity-60 sm:text-base"> / {fiches.length}</span></p>
        </div>
        <div className="rounded-2xl border border-black/10 p-3 dark:border-white/10 sm:p-4">
          <p className="text-[10px] uppercase opacity-60 sm:text-xs">Série</p>
          <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{data.serie} <span className="text-sm opacity-60 sm:text-base">j</span></p>
        </div>
        <div className="rounded-2xl border border-black/10 p-3 dark:border-white/10 sm:p-4">
          <p className="text-[10px] uppercase opacity-60 sm:text-xs">Révisions du jour</p>
          <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{data.dues.length}</p>
        </div>
      </div>

      {data.suivante && (
        <Link to={`/fiche/${data.suivante.id}`} className="block rounded-2xl bg-or p-5 text-nuit">
          <p className="text-xs font-semibold uppercase opacity-80">Continuer le parcours · {data.suivante.module}</p>
          <p className="font-serif text-2xl font-semibold">{data.suivante.titre} →</p>
        </Link>
      )}

      {data.dues.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">À revoir aujourd’hui</h2>
          <ul className="flex flex-wrap gap-2">
            {data.dues.map((f) => <li key={f!.id}><Link className="inline-block rounded-full border border-or px-3 py-1.5 text-sm" to={`/fiche/${f!.id}`}>{f!.titre}</Link></li>)}
          </ul>
        </div>
      )}
      {data.fragiles.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Notions fragiles</h2>
          <ul className="flex flex-wrap gap-2">
            {data.fragiles.map((f) => <li key={f!.id}><Link className="inline-block rounded-full border border-bordeaux px-3 py-1.5 text-sm" to={`/fiche/${f!.id}`}>{f!.titre}</Link></li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['/entrainement', '🎹 S’entraîner', 'Accords, gammes et grilles validés au clavier MIDI ou au micro'],
          ['/pad', '🌫 Pad de louange', 'Une nappe tenue pour la prière, dans toutes les tonalités'],
          ['/dimanche', '📅 Prêt pour dimanche', 'Ton set, un plan sur 7 jours et un test final'],
          ['/outils', '🧰 Tous les outils', 'Groupe virtuel, orgue, oreille, fréquences, grilles…'],
        ].map(([to, t, d]) => (
          <Link key={to} to={to} className="rounded-2xl border border-black/10 p-4 hover:border-or dark:border-white/10">
            <p className="font-semibold">{t}</p>
            <p className="text-sm opacity-75">{d}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
