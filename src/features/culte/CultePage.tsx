import { useEffect, useRef, useState } from 'react';
import { MOMENTS, evaluateMoment, Feedback, NoteEvent } from './moments';
import { useMidiInput } from '../midi/useMidiInput';
import { getCtx, INSTRUMENTS } from '../../audio/engine';
import { barToChartChords } from '../nashville/nashville';
import { toMidi } from '../../theory/notes';
import { voiceLead } from '../../theory/voiceLeading';
import { closeVoicing } from '../../theory/chords';
import { Keyboard } from '../keyboard/keyboard';
import { logPractice } from '../../lib/progress';

const DUREE = 30;
const KEYS = ['C', 'D', 'Eb', 'E', 'F', 'G', 'A', 'Bb'];

export default function CultePage() {
  const [id, setId] = useState(MOMENTS[0].id);
  const [key, setKey] = useState('D');
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(DUREE);
  const [result, setResult] = useState<Feedback[] | null>(null);
  const events = useRef<NoteEvent[]>([]);
  const t0 = useRef(0);
  const timers = useRef<number[]>([]);
  const m = MOMENTS.find((x) => x.id === id)!;

  const record = (note: number, velocity: number) => {
    if (!running) return;
    events.current.push({ note, velocity, at: (performance.now() - t0.current) / 1000 });
  };
  const midi = useMidiInput((e) => {
    if (!e.on) return;
    INSTRUMENTS.piano([e.note], (getCtx()?.currentTime ?? 0) + 0.005, 1.2, e.velocity / 127);
    record(e.note, e.velocity);
  });

  const stopAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => stopAll, []);

  const start = () => {
    const c = getCtx(); if (!c) return;
    stopAll();
    events.current = [];
    setResult(null);
    setRunning(true);
    t0.current = performance.now();
    // Fond musical : pad (et basse discrète) sur la grille du moment, pendant 30 s.
    let prev: number[] = [];
    const n = Math.ceil(DUREE / m.secParAccord);
    for (let i = 0; i < n; i++) {
      const cc = barToChartChords(key, m.fond[i % m.fond.length])[0];
      prev = prev.length ? voiceLead(prev, cc.chord, 55, 74) : closeVoicing(cc.chord.notes, toMidi(cc.chord.notes[0], 4));
      const t = c.currentTime + 0.1 + i * m.secParAccord;
      INSTRUMENTS.pad(prev, t, m.secParAccord, 0.55);
      if (id !== 'priere' && id !== 'parole') INSTRUMENTS.basse([toMidi(cc.bass ?? cc.chord.root, 2)], t, m.secParAccord * 0.9, 0.5);
    }
    for (let s = 1; s <= DUREE; s++) timers.current.push(window.setTimeout(() => setLeft(DUREE - s), s * 1000));
    setLeft(DUREE);
    timers.current.push(window.setTimeout(() => {
      setRunning(false);
      setResult(evaluateMoment(events.current, DUREE, m.profil));
      logPractice('culte', 1);
    }, DUREE * 1000 + 200));
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Simulateur de moments de culte</h1>
        <p className="text-sm opacity-80">Choisis un moment : l’app joue le fond pendant {DUREE} s, tu accompagnes au clavier (MIDI : {midi.status}, ou à l’écran), puis tu reçois un retour sur la densité, la nuance et le registre.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {MOMENTS.map((x) => (
          <button key={x.id} type="button" onClick={() => { setId(x.id); setResult(null); }} aria-pressed={x.id === id}
            className={`rounded-full border px-3 py-1.5 text-sm ${x.id === id ? 'border-or bg-or/20 font-semibold' : 'border-black/10 dark:border-white/10'}`}>{x.nom}</button>
        ))}
      </div>
      <article className="space-y-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-lg font-semibold text-or">{m.nom}</h2>
        <p className="text-sm"><strong>Dynamique :</strong> {m.dynamique}</p>
        <ul className="list-disc space-y-1 pl-6 text-sm">{m.consignes.map((c) => <li key={c}>{c}</li>)}</ul>
        <p className="rounded-lg bg-bordeaux/10 p-3 text-sm"><strong>Erreur fréquente :</strong> {m.erreur}</p>
        <p className="text-xs opacity-70">Fond joué : {m.fond.map((t) => barToChartChords(key, t)[0].symbol).join(' – ')} · un accord toutes les {m.secParAccord} s.</p>
      </article>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Tonalité
          <select value={key} onChange={(e) => setKey(e.target.value)} disabled={running} className="ml-2 rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit">
            {KEYS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </label>
        {!running
          ? <button type="button" onClick={start} className="rounded-xl bg-or px-5 py-3 font-semibold text-nuit">▶ Pratiquer ce moment ({DUREE} s)</button>
          : <span className="text-2xl font-semibold tabular-nums">{left} s</span>}
      </div>
      <Keyboard from={48} octaves={typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 3} active={midi.active}
        onKey={(n) => { INSTRUMENTS.piano([n], (getCtx()?.currentTime ?? 0) + 0.005, 1.2, 0.6); record(n, 64); }} />
      {result && (
        <ul className="space-y-2">
          {result.map((f) => <li key={f.message} className={`rounded-xl p-3 text-sm ${f.ok ? 'bg-sauge/20' : 'bg-bordeaux/15'}`}>{f.ok ? '✓' : '✗'} {f.message}</li>)}
        </ul>
      )}
    </section>
  );
}
