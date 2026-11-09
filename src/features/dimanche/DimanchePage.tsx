import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSet, saveSet, weekPlan, FINAL_CRITERIA, encodeSet, decodeSet, WorshipSet } from './set';
import { getCharts } from '../nashville/charts';
import { repo } from '../../lib/repository';
import { logPractice } from '../../lib/progress';

const input = 'min-w-0 rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit';

export default function DimanchePage() {
  const [set, setSetState] = useState<WorshipSet>(getSet);
  const [checks, setChecks] = useState<Record<string, boolean>>(() => repo().get('wa-set-test', {}));
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const charts = useMemo(getCharts, []);
  const update = (s: WorshipSet) => { setSetState(s); saveSet(s); };
  const setSong = (i: number, patch: Partial<WorshipSet['chants'][number]>) => update({ ...set, chants: set.chants.map((c, j) => (i === j ? { ...c, ...patch } : c)) });
  const plan = weekPlan(set);
  const toggle = (k: string) => { const n = { ...checks, [k]: !checks[k] }; setChecks(n); repo().set('wa-set-test', n); if (n[k]) logPractice('test-dimanche', 1); };
  const total = set.chants.length * FINAL_CRITERIA.length;
  const ok = Object.entries(checks).filter(([k, v]) => v && Number(k.split(':')[0]) < set.chants.length).length;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Prêt pour dimanche</h1>
        <p className="text-sm opacity-80">Entre ton set : l’app prépare ta semaine et un test final. Lie chaque chant à une grille pour l’ouvrir avec le groupe virtuel.</p>
      </div>
      <label className="block text-sm">Date du service
        <input type="date" value={set.date} onChange={(e) => update({ ...set, date: e.target.value })} className={`${input} block`} />
      </label>
      <div className="space-y-3">
        {set.chants.map((s, i) => (
          <div key={i} className="grid gap-2 rounded-xl border border-black/10 p-3 dark:border-white/10 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto]">
            <input aria-label="Titre" placeholder={`Chant ${i + 1}`} value={s.titre} onChange={(e) => setSong(i, { titre: e.target.value })} className={input} />
            <input aria-label="Tonalité" placeholder="Tonalité" value={s.tonalite} onChange={(e) => setSong(i, { tonalite: e.target.value })} className={input} />
            <input aria-label="Tempo" type="number" value={s.bpm} onChange={(e) => setSong(i, { bpm: Number(e.target.value) })} className={input} />
            <select aria-label="Grille liée" value={s.grille ? charts.find((c) => c.title === s.grille!.title)?.id ?? '' : ''}
              onChange={(e) => { const c = charts.find((x) => x.id === e.target.value); setSong(i, { grille: c, ...(c ? { tonalite: c.key, bpm: c.bpm, titre: s.titre || c.title } : {}) }); }} className={input}>
              <option value="">— grille —</option>
              {charts.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <span className="flex gap-1">
              {s.grille && <Link className="rounded-lg border border-black/15 px-2 py-2 text-sm dark:border-white/20" to={`/groupe?grille=${charts.find((c) => c.title === s.grille!.title)?.id ?? ''}&cle=${encodeURIComponent(s.tonalite)}`}>▶</Link>}
              <button type="button" aria-label="Retirer" className="rounded-lg border border-black/15 px-3 dark:border-white/20" onClick={() => update({ ...set, chants: set.chants.filter((_, j) => j !== i) })}>✕</button>
            </span>
          </div>
        ))}
        <button type="button" className="text-sm text-or underline" onClick={() => update({ ...set, chants: [...set.chants, { titre: '', tonalite: 'C', bpm: 72 }] })}>+ Ajouter un chant</button>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-or">Plan sur 7 jours</h2>
        <ol className="space-y-2">
          {plan.map((p) => (
            <li key={p.jour} className="rounded-xl border border-black/10 p-3 dark:border-white/10">
              <p className="font-semibold">{p.jour} <span className="text-sm font-normal opacity-60">· {p.minutes} min</span></p>
              <p className="text-sm">{p.focus}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-or">Test final · {ok}/{total}</h2>
        {set.chants.map((s, i) => (
          <details key={i} className="rounded-xl border border-black/10 p-3 dark:border-white/10" open={i === 0}>
            <summary className="cursor-pointer font-medium">{s.titre || `Chant ${i + 1}`} · {s.tonalite} · {s.bpm} BPM</summary>
            <ul className="mt-2 space-y-1">
              {FINAL_CRITERIA.map((c, j) => (
                <li key={c}><label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 h-5 w-5" checked={!!checks[`${i}:${j}`]} onChange={() => toggle(`${i}:${j}`)} />{c}</label></li>
              ))}
            </ul>
          </details>
        ))}
        {total > 0 && ok === total && <p className="rounded-xl bg-sauge/20 p-3 text-sm font-semibold">Tu es prêt pour dimanche. Que ton jeu serve la rencontre avec Dieu.</p>}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-or">Partager le set</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20" onClick={async () => {
            const c = encodeSet(set);
            try { await navigator.clipboard.writeText(c); setMsg('Code du set copié.'); } catch { setCode(c); setMsg('Le code est dans le champ ci-dessous.'); }
          }}>Copier le code du set</button>
          <input aria-label="Code de set à importer" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Colle le code reçu du responsable…" className={`${input} min-w-0 flex-1`} />
          <button type="button" className="rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20" onClick={() => {
            const s = decodeSet(code);
            if (!s) { setMsg('Code invalide.'); return; }
            update(s); setChecks({}); repo().set('wa-set-test', {}); setCode(''); setMsg('Set importé.');
          }}>Importer</button>
        </div>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </div>
    </section>
  );
}
