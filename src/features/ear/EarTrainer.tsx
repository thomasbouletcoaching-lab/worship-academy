import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { makeQuestion, EarMode, Question } from './questions';
import { getCtx, INSTRUMENTS } from '../../audio/engine';
import { recordEar, getEar } from '../../lib/progress';

const MODES: [EarMode, string, string][] = [
  ['intervalles', 'Intervalles', 'Deux notes : nomme l’écart.'],
  ['accords', 'Qualités d’accords', 'Majeur, mineur, 7e… : reconnais la couleur.'],
  ['degres', 'Degrés', 'Une cadence installe la tonalité, puis un accord : « c’est le 4 ».'],
  ['basse', 'Mouvements de basse', 'La basse part du 1 : où va-t-elle ?'],
  ['progressions', 'Progressions', 'Quatre accords : quelle grille ?'],
  ['modulations', 'Modulations', 'Une tonalité, puis une autre : de combien a-t-on monté ?'],
];

function play(q: Question) {
  const c = getCtx(); if (!c) return;
  const t0 = c.currentTime + 0.05;
  for (const h of q.hits) {
    if (!h.notes.length) continue;
    const bass = h.notes.filter((m) => m < 48);
    const upper = h.notes.filter((m) => m >= 48);
    if (bass.length) INSTRUMENTS.basse(bass, t0 + h.at, h.dur, 0.8);
    if (upper.length) INSTRUMENTS.piano(upper, t0 + h.at, h.dur, 0.75);
  }
}

export default function EarTrainer() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<EarMode>((params.get('mode') as EarMode) || 'intervalles');
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [q, setQ] = useState<Question | null>(null);
  const [answered, setAnswered] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const stats = getEar();

  const next = useCallback(() => {
    const nq = makeQuestion(mode, Math.random, level);
    setQ(nq);
    setAnswered(null);
    play(nq);
  }, [mode, level]);

  useEffect(() => { setQ(null); setAnswered(null); setScore({ ok: 0, total: 0 }); }, [mode, level]);

  const guess = (choice: string) => {
    if (!q || answered) return;
    const ok = choice === q.answer;
    setAnswered(choice);
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    recordEar(mode, q.answer, ok);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Entraîneur d’oreille louange</h1>
        <p className="text-sm opacity-80">Ton oreille est ton premier instrument. Quelques minutes par jour suffisent ; tes résultats alimentent la page Progrès.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map(([id, label, desc]) => {
          const st = stats[id];
          return (
            <button key={id} type="button" onClick={() => setMode(id)} aria-pressed={mode === id}
              className={`rounded-xl border p-3 text-left ${mode === id ? 'border-or bg-or/15' : 'border-black/10 dark:border-white/10'}`}>
              <span className="block font-semibold">{label}</span>
              <span className="block text-xs opacity-75">{desc}</span>
              {st && <span className="mt-1 block text-xs opacity-60">{Math.round((st.ok / st.total) * 100)} % sur {st.total}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>Niveau :</span>
        {([1, 2, 3] as const).map((l) => (
          <button key={l} type="button" onClick={() => setLevel(l)} className={`rounded-full border px-3 py-1 ${level === l ? 'border-or bg-or/20 font-semibold' : 'border-black/10 dark:border-white/10'}`}>
            {l === 1 ? '🟢 Découverte' : l === 2 ? '🟡 Maîtrise' : '🔴 Virtuose'}
          </button>
        ))}
        <span className="ml-auto tabular-nums">Score : {score.ok}/{score.total}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={next} className="rounded-xl bg-or px-5 py-3 text-base font-semibold text-nuit">{q ? 'Question suivante →' : '▶ Commencer'}</button>
        {q && <button type="button" onClick={() => play(q)} className="rounded-xl border border-black/15 px-5 py-3 dark:border-white/20">↻ Réécouter</button>}
      </div>
      {q && (
        <div className="grid gap-2 sm:grid-cols-2">
          {q.choices.map((c) => {
            const state = !answered ? '' : c === q.answer ? 'border-sauge bg-sauge/25' : c === answered ? 'border-bordeaux bg-bordeaux/20' : 'opacity-50';
            return (
              <button key={c} type="button" onClick={() => guess(c)} disabled={!!answered}
                className={`rounded-xl border border-black/10 px-4 py-3 text-left text-base dark:border-white/10 ${state}`}>{c}</button>
            );
          })}
        </div>
      )}
      {q && answered && (
        <p role="status" className={`rounded-xl p-3 text-sm ${answered === q.answer ? 'bg-sauge/20' : 'bg-bordeaux/15'}`}>
          {answered === q.answer ? '✓ Bravo. ' : '✗ Pas tout à fait. '}{q.explication}
        </p>
      )}
    </section>
  );
}
