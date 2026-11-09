import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCharts, saveCharts, newChart, SavedChart, encodeChart, decodeChart } from './charts';
import { parseBars, chartErrors, renderChartSymbols } from './nashville';
import { transposeNote, parseNote, noteName } from '../../theory/notes';

const KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm'];
const SECTION_NAMES = ['Intro', 'Couplet', 'Pré-refrain', 'Refrain', 'Pont', 'Interlude', 'Tag', 'Vamp', 'Fin'];
const input = 'rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit';

/** Tonalité transposée de n demi-tons (orthographe en bémols pour les tonalités majeures usuelles). */
function shiftKey(key: string, n: number): string {
  const minor = key.endsWith('m');
  const t = transposeNote(parseNote(key.replace(/m$/, '')), ((n % 12) + 12) % 12, true);
  let name = noteName(t);
  const prefer: Record<string, string> = { 'A#': 'Bb', 'D#': 'Eb', 'G#': minor ? 'G#' : 'Ab', 'C#': minor ? 'C#' : 'Db', 'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C', 'Gb': minor ? 'F#' : 'Gb' };
  name = prefer[name] ?? name;
  return name + (minor ? 'm' : '');
}

export default function NashvillePage() {
  const [charts, setCharts] = useState<SavedChart[]>(getCharts);
  const [currentId, setCurrentId] = useState(charts[0]?.id);
  const [view, setView] = useState<'accords' | 'chiffres'>('accords');
  const [shift, setShift] = useState(0);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const chart = charts.find((c) => c.id === currentId) ?? charts[0];

  const update = (patch: Partial<SavedChart>) => {
    const next = charts.map((c) => (c.id === chart.id ? { ...c, ...patch, updated: new Date().toISOString() } : c));
    setCharts(next);
    saveCharts(next);
  };
  const shown = useMemo(() => ({ ...chart, key: shiftKey(chart.key, shift) }), [chart, shift]);
  const errors = useMemo(() => chartErrors(chart), [chart]);
  const rendered = useMemo(() => renderChartSymbols(shown), [shown]);

  const add = () => { const c = newChart(); const next = [c, ...charts]; setCharts(next); saveCharts(next); setCurrentId(c.id); setShift(0); };
  const duplicate = () => { const c = { ...chart, id: `g-${Date.now().toString(36)}`, title: `${chart.title} (copie)` }; const next = [c, ...charts]; setCharts(next); saveCharts(next); setCurrentId(c.id); };
  const remove = () => {
    if (!window.confirm(`Supprimer « ${chart.title} » ?`)) return;
    const next = charts.filter((c) => c.id !== chart.id);
    const list = next.length ? next : [newChart()];
    setCharts(list); saveCharts(list); setCurrentId(list[0].id);
  };
  const setSection = (i: number, patch: Partial<{ name: string; bars: string[] }>) =>
    update({ sections: chart.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const moveSection = (i: number, d: -1 | 1) => {
    const s = [...chart.sections];
    const j = i + d;
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]];
    update({ sections: s });
  };
  const importCode = () => {
    const c = decodeChart(code);
    if (!c) { setMsg('Code invalide.'); return; }
    const sc: SavedChart = { ...c, id: `g-${Date.now().toString(36)}`, updated: new Date().toISOString() };
    const next = [sc, ...charts]; setCharts(next); saveCharts(next); setCurrentId(sc.id); setCode(''); setMsg('Grille importée.');
  };
  const exportCode = async () => {
    const c = encodeChart(chart);
    try { await navigator.clipboard.writeText(c); setMsg('Code copié : colle-le dans l’app d’un autre musicien.'); } catch { setCode(c); setMsg('Copie impossible : le code est dans le champ ci-dessous.'); }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <h1 className="mr-auto font-serif text-2xl font-semibold">Grilles en Nashville</h1>
        <select aria-label="Grille" value={chart.id} onChange={(e) => { setCurrentId(e.target.value); setShift(0); }} className={input}>
          {charts.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <button type="button" onClick={add} className="rounded-lg bg-or px-3 py-2 text-sm font-semibold text-nuit">+ Nouvelle</button>
      </div>
      <p className="text-sm opacity-80 print:hidden">
        Écris les mesures en chiffres, séparées par « | » ou un retour à la ligne. Deux accords dans une mesure : « 1 5 ». Exemples : <code>6m</code>, <code>57</code>, <code>1/3</code> (basse sur la tierce),
        <code> 4maj7</code>, <code>5sus</code>, <code>b7</code> (emprunt), <code>%</code> (répète la mesure). Uniquement des grilles : jamais de paroles.
      </p>

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr] print:hidden">
        <input aria-label="Titre" value={chart.title} onChange={(e) => update({ title: e.target.value })} className={input} />
        <select aria-label="Tonalité d’écriture" value={chart.key} onChange={(e) => { update({ key: e.target.value }); setShift(0); }} className={input}>
          {KEYS.map((k) => <option key={k}>{k}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">BPM
          <input type="number" min={40} max={200} value={chart.bpm} onChange={(e) => update({ bpm: Number(e.target.value) })} className={`${input} w-24`} />
        </label>
      </div>

      <div className="space-y-3 print:hidden">
        {chart.sections.map((s, i) => (
          <div key={i} className="rounded-xl border border-black/10 p-3 dark:border-white/10">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <input list="section-names" aria-label="Nom de la section" value={s.name} onChange={(e) => setSection(i, { name: e.target.value })} className={`${input} w-40`} />
              <span className="text-xs opacity-60">{s.bars.length} mesure(s)</span>
              <span className="ml-auto flex gap-1">
                <button type="button" aria-label="Monter" className="rounded px-2 py-1" onClick={() => moveSection(i, -1)}>↑</button>
                <button type="button" aria-label="Descendre" className="rounded px-2 py-1" onClick={() => moveSection(i, 1)}>↓</button>
                <button type="button" aria-label="Supprimer la section" className="rounded px-2 py-1" onClick={() => update({ sections: chart.sections.filter((_, j) => j !== i) })}>✕</button>
              </span>
            </div>
            <textarea aria-label={`Mesures de ${s.name}`} rows={2} defaultValue={s.bars.join(' | ')} key={`${chart.id}-${i}-${s.bars.length}`}
              onBlur={(e) => setSection(i, { bars: parseBars(e.target.value) })}
              className={`${input} w-full font-mono`} />
          </div>
        ))}
        <datalist id="section-names">{SECTION_NAMES.map((n) => <option key={n} value={n} />)}</datalist>
        <button type="button" onClick={() => update({ sections: [...chart.sections, { name: 'Refrain', bars: ['1'] }] })} className="text-sm text-or underline">+ Ajouter une section</button>
      </div>

      {errors.length > 0 && (
        <ul className="rounded-xl bg-bordeaux/15 p-3 text-sm print:hidden">{errors.map((e) => <li key={e}>⚠ {e}</li>)}</ul>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <span className="text-sm">Afficher :</span>
          {(['accords', 'chiffres'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} className={`rounded-full border px-3 py-1 text-sm ${view === v ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{v === 'accords' ? 'Accords' : 'Chiffres'}</button>
          ))}
          <span className="ml-2 text-sm">Transposer :</span>
          <button type="button" aria-label="Un demi-ton plus bas" onClick={() => setShift((x) => x - 1)} className="rounded-lg border border-black/15 px-3 py-1 dark:border-white/20">−½</button>
          <strong className="w-12 text-center">{shown.key}</strong>
          <button type="button" aria-label="Un demi-ton plus haut" onClick={() => setShift((x) => x + 1)} className="rounded-lg border border-black/15 px-3 py-1 dark:border-white/20">+½</button>
        </div>
        <h2 className="font-serif text-xl font-semibold">{chart.title} · {shown.key} · {chart.bpm} BPM</h2>
        {chart.sections.map((s, i) => (
          <div key={i} className="break-inside-avoid">
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-or">{s.name}</h3>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {s.bars.map((b, j) => (
                <div key={j} className="rounded-md border border-black/15 px-2 py-3 text-center font-mono text-lg dark:border-white/15">
                  {view === 'chiffres' ? b : (rendered[i]?.bars[j] ?? []).join(' ')}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Link to={`/groupe?grille=${chart.id}&cle=${encodeURIComponent(shown.key)}`} className="rounded-lg bg-or px-3 py-2 text-sm font-semibold text-nuit">▶ Jouer avec le groupe virtuel</Link>
        <button type="button" onClick={() => window.print()} className="rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20">🖨 Imprimer / PDF</button>
        <button type="button" onClick={exportCode} className="rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20">Partager (code)</button>
        <button type="button" onClick={duplicate} className="rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20">Dupliquer</button>
        <button type="button" onClick={remove} className="rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20">Supprimer</button>
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        <input aria-label="Code de grille à importer" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Colle un code de grille…" className={`${input} min-w-0 flex-1`} />
        <button type="button" onClick={importCode} className="rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20">Importer</button>
      </div>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </section>
  );
}
