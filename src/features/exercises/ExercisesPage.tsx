import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Keyboard, Mark, rangeFor } from '../keyboard/keyboard';
import { useMidiInput, MidiEvent } from '../midi/useMidiInput';
import { playNotes } from '../../audio/synth';
import { getCtx, clickAt, INSTRUMENTS, getAnalyser } from '../../audio/engine';
import { detectPitch, centsOff } from '../../audio/pitchDetect';
import { checkChord, timing, velocityRegularity, sequenceAccuracy, verdict } from './evaluate';
import { randomChord, scaleTarget, progressionTarget, PROGRESSIONS, KEYS, PALIER_BPM, ChordTarget } from './generators';
import { closeVoicing } from '../../theory/chords';
import { toMidi } from '../../theory/notes';
import { midiName, hzToMidi } from '../../theory/pitch';
import { recordExercise } from '../../lib/progress';

type Tab = 'accords' | 'gammes' | 'progression' | 'micro';
type Palier = 1 | 2 | 3;
const TABS: [Tab, string][] = [['accords', 'Accords'], ['gammes', 'Gammes au métronome'], ['progression', 'Grille au métronome'], ['micro', 'Micro (une note)']];

const btn = 'rounded-xl px-4 py-3 text-base font-semibold';
const btnMain = `${btn} bg-or text-nuit`;
const btnSec = `${btn} border border-black/15 dark:border-white/20`;

function Result({ lines, ok }: { lines: string[]; ok: boolean | null }) {
  if (ok === null) return null;
  return (
    <div role="status" className={`rounded-xl p-4 text-sm ${ok ? 'bg-sauge/20' : 'bg-bordeaux/15'}`}>
      <p className="font-semibold">{ok ? '✓ Réussi' : '✗ Pas encore'}</p>
      {lines.map((l) => <p key={l}>{l}</p>)}
    </div>
  );
}

/** Convertit un instant audio en horloge performance.now(). */
function perfAt(audioTime: number): number {
  const c = getCtx();
  return c ? performance.now() + (audioTime - c.currentTime) * 1000 : performance.now();
}

// ---------------------------------------------------------------- Accords
function ChordExercise({ palier, listen }: { palier: Palier; listen: (h: ((e: MidiEvent) => void) | null) => void }) {
  const [target, setTarget] = useState<ChordTarget>(() => randomChord(palier));
  const [held, setHeld] = useState<number[]>([]);
  const [res, setRes] = useState<{ ok: boolean | null; lines: string[] }>({ ok: null, lines: [] });
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const t0 = useRef(performance.now());
  const done = useRef(false);

  const next = useCallback(() => {
    setTarget(randomChord(palier));
    setHeld([]);
    setRes({ ok: null, lines: [] });
    done.current = false;
    t0.current = performance.now();
  }, [palier]);
  useEffect(next, [next]);

  const evaluate = useCallback((notes: number[]) => {
    if (done.current || !notes.length) return;
    const r = checkChord(target.pcs, notes, target.bassPc);
    const secs = ((performance.now() - t0.current) / 1000).toFixed(1);
    const lines: string[] = [];
    if (r.manquantes.length) lines.push(`Il manque : ${r.manquantes.map((p) => midiName(60 + p, true).replace(/\d/, '')).join(', ')}`);
    if (r.enTrop.length) lines.push(`En trop : ${r.enTrop.map((p) => midiName(60 + p, true).replace(/\d/, '')).join(', ')}`);
    if (!r.basseOk) lines.push('La note la plus grave n’est pas la basse demandée.');
    if (r.ok) lines.push(`Trouvé en ${secs} s.`);
    done.current = true;
    setRes({ ok: r.ok, lines });
    setScore((s) => ({ ok: s.ok + (r.ok ? 1 : 0), total: s.total + 1 }));
    recordExercise({ exercise: `accord-p${palier}`, justesse: r.ok ? 100 : 0, ecartMs: null, regularite: null, reussi: r.ok });
  }, [target, palier]);

  // Évaluation automatique dès que les notes tenues contiennent l'accord.
  useEffect(() => {
    listen((e) => {
      setHeld((prev) => {
        const next = e.on ? (prev.includes(e.note) ? prev : [...prev, e.note]) : prev.filter((n) => n !== e.note);
        const pcs = new Set(next.map((m) => m % 12));
        if (e.on && target.pcs.every((p) => pcs.has(p))) window.setTimeout(() => evaluate(next), 120);
        return next;
      });
    });
    return () => listen(null);
  }, [listen, target, evaluate]);

  const marks: Record<number, Mark> = {};
  for (const m of held) marks[m] = target.pcs.includes(m % 12) ? 'juste' : 'faux';
  const toggle = (m: number) => {
    playNotes([m], 0.6);
    setHeld((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 p-5 text-center dark:border-white/10">
        <p className="text-sm opacity-70">Joue cet accord (n’importe quel renversement{target.bassPc !== undefined ? ', mais avec la basse demandée' : ''})</p>
        <p className="font-serif text-5xl font-semibold text-or">{target.label}</p>
        <p className="mt-1 text-sm opacity-70">{target.chord.name}</p>
        <p className="mt-2 text-xs opacity-60">Score : {score.ok}/{score.total}</p>
      </div>
      <Keyboard from={48} octaves={typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 3} marks={marks} onKey={toggle} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnSec} onClick={() => playNotes(closeVoicing(target.chord.notes, toMidi(target.chord.notes[0], 4)), 1.5)}>▶ Écouter</button>
        <button type="button" className={btnSec} onClick={() => evaluate(held)}>Valider</button>
        <button type="button" className={btnSec} onClick={() => setHeld([])}>Effacer</button>
        <button type="button" className={btnMain} onClick={next}>Accord suivant →</button>
      </div>
      <Result ok={res.ok} lines={res.lines} />
    </div>
  );
}

// ---------------------------------------------------------------- Gammes et grilles au métronome
interface Take { notes: { note: number; vel: number; at: number }[]; }

function useCountInRun(bpm: number) {
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(-1);
  const timers = useRef<number[]>([]);
  /** Lance 4 temps de décompte puis `beats` temps ; renvoie l'instant (performance.now) du 1er temps joué. */
  const start = (beats: number, onBeat?: (i: number, audioTime: number) => void, onEnd?: () => void): number => {
    const c = getCtx();
    if (!c) return performance.now();
    const beatSec = 60 / bpm;
    const t0 = c.currentTime + 0.2;
    for (let i = 0; i < 4 + beats; i++) {
      const t = t0 + i * beatSec;
      clickAt(t, i % 4 === 0);
      if (i >= 4) onBeat?.(i - 4, t);
      timers.current.push(window.setTimeout(() => setBeat(i - 4), (t - c.currentTime) * 1000));
    }
    const endAt = t0 + (4 + beats) * beatSec;
    timers.current.push(window.setTimeout(() => { setRunning(false); setBeat(-1); onEnd?.(); }, (endAt - c.currentTime) * 1000 + 300));
    setRunning(true);
    return perfAt(t0 + 4 * beatSec);
  };
  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; setRunning(false); setBeat(-1); };
  useEffect(() => stop, []);
  return { running, beat, start, stop };
}

function ScaleExercise({ palier, listen }: { palier: Palier; listen: (h: ((e: MidiEvent) => void) | null) => void }) {
  const [key, setKey] = useState('C');
  const [bpm, setBpm] = useState(PALIER_BPM[palier]);
  useEffect(() => setBpm(PALIER_BPM[palier]), [palier]);
  const target = useMemo(() => scaleTarget(key), [key]);
  const take = useRef<Take>({ notes: [] });
  const startMs = useRef(0);
  const [played, setPlayed] = useState<number[]>([]);
  const [res, setRes] = useState<{ ok: boolean | null; lines: string[] }>({ ok: null, lines: [] });
  const run = useCountInRun(bpm);

  useEffect(() => {
    listen((e) => {
      if (!e.on || !run.running) return;
      take.current.notes.push({ note: e.note, vel: e.velocity, at: e.at });
      setPlayed((p) => [...p, e.note]);
    });
    return () => listen(null);
  }, [listen, run.running]);

  const finish = () => {
    const ns = take.current.notes.filter((n) => n.at > startMs.current - 60000 / bpm / 2);
    const notes = ns.map((n) => n.note);
    const just = sequenceAccuracy(target, notes);
    const t = timing(ns.map((n) => n.at), startMs.current, 60000 / bpm);
    const reg = velocityRegularity(ns.map((n) => n.vel));
    const v = verdict(just, ns.length ? t.moyenneMs : null, palier);
    const lines = [
      `Justesse : ${just} % (${notes.length}/${target.length} notes jouées)`,
      ns.length ? `Rythme : écart moyen ${t.moyenneMs} ms, max ${t.maxMs} ms, ${t.tendanceMs < -5 ? `tendance à presser (${t.tendanceMs} ms)` : t.tendanceMs > 5 ? `tendance à traîner (+${t.tendanceMs} ms)` : 'bien centré'}` : 'Aucune note captée.',
      `Régularité du toucher : ${reg}/100`,
      v.message,
    ];
    setRes({ ok: v.reussi, lines });
    recordExercise({ exercise: `gamme-${key}`, justesse: just, ecartMs: ns.length ? t.moyenneMs : null, regularite: reg, reussi: v.reussi });
  };

  const go = () => {
    take.current = { notes: [] };
    setPlayed([]);
    setRes({ ok: null, lines: [] });
    startMs.current = run.start(target.length, undefined, finish);
  };

  const marks: Record<number, Mark> = {};
  target.forEach((m) => { marks[m] = 'cible'; });
  played.forEach((m, i) => { marks[m] = target[i] !== undefined && m % 12 === target[i] % 12 ? 'juste' : 'faux'; });
  const r = rangeFor([...target, ...played]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">Tonalité
          <select value={key} onChange={(e) => setKey(e.target.value)} className="block rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit">
            {KEYS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </label>
        <label className="text-sm">Tempo : {bpm} BPM
          <input type="range" min={40} max={140} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="block w-48" />
        </label>
      </div>
      <p className="text-sm opacity-80">Main droite, gamme montante de {key} majeur, une note par temps, après 4 temps de décompte. Doigté : 1-2-3-1-2-3-4-5 (C, G, D, A, E) ; voir la fiche « Doigtés des gammes » pour les autres.</p>
      <Keyboard from={r.from} octaves={r.octaves} marks={marks} onKey={(m) => { playNotes([m], 0.4); if (run.running) { take.current.notes.push({ note: m, vel: 90, at: performance.now() }); setPlayed((p) => [...p, m]); } }} />
      <div className="flex flex-wrap items-center gap-3">
        {!run.running ? <button type="button" className={btnMain} onClick={go}>▶ Démarrer</button> : <button type="button" className={btnSec} onClick={run.stop}>■ Arrêter</button>}
        <span className="text-2xl font-semibold tabular-nums">{run.running ? (run.beat < 0 ? `Décompte ${run.beat + 5}` : `Temps ${run.beat + 1}/${target.length}`) : ''}</span>
      </div>
      <Result ok={res.ok} lines={res.lines} />
    </div>
  );
}

function ProgressionExercise({ palier, listen }: { palier: Palier; listen: (h: ((e: MidiEvent) => void) | null) => void }) {
  const [key, setKey] = useState('G');
  const [progIdx, setProgIdx] = useState(0);
  const [bpm, setBpm] = useState(PALIER_BPM[palier]);
  const [withBass, setWithBass] = useState(true);
  useEffect(() => setBpm(PALIER_BPM[palier]), [palier]);
  const chords = useMemo(() => progressionTarget(key, PROGRESSIONS[progIdx].bars), [key, progIdx]);
  const take = useRef<{ note: number; at: number }[]>([]);
  const startMs = useRef(0);
  const [res, setRes] = useState<{ ok: boolean | null; lines: string[] }>({ ok: null, lines: [] });
  const [bar, setBar] = useState(-1);
  const run = useCountInRun(bpm);

  useEffect(() => {
    listen((e) => { if (e.on && run.running) take.current.push({ note: e.note, at: e.at }); });
    return () => listen(null);
  }, [listen, run.running]);

  const finish = () => {
    const beatMs = 60000 / bpm;
    const barMs = beatMs * 4;
    const lines: string[] = [];
    let okCount = 0;
    const devs: number[] = [];
    chords.forEach((ch, i) => {
      const down = startMs.current + i * barMs;
      // Attaque = notes jouées dans une fenêtre de −½ temps à +1 temps autour du premier temps.
      const win = take.current.filter((n) => n.at >= down - beatMs / 2 && n.at < down + beatMs);
      if (!win.length) { lines.push(`Mesure ${i + 1} (${ch.symbol}) : rien joué sur le 1er temps.`); return; }
      const r = checkChord(ch.notes.map((n) => toMidi(n, 4) % 12), win.map((n) => n.note));
      const dev = Math.round(Math.min(...win.map((n) => n.at)) - down);
      devs.push(Math.abs(dev));
      if (r.ok) okCount++;
      lines.push(`Mesure ${i + 1} (${ch.symbol}) : ${r.ok ? 'juste' : 'notes à revoir'}, ${dev >= 0 ? '+' : ''}${dev} ms`);
    });
    const just = Math.round((okCount / chords.length) * 100);
    const mean = devs.length ? Math.round(devs.reduce((a, b) => a + b, 0) / devs.length) : null;
    const v = verdict(just, mean, palier);
    lines.push(v.message);
    setRes({ ok: v.reussi, lines });
    recordExercise({ exercise: `grille-${PROGRESSIONS[progIdx].nom}-${key}`, justesse: just, ecartMs: mean, regularite: null, reussi: v.reussi });
  };

  const go = () => {
    take.current = [];
    setRes({ ok: null, lines: [] });
    startMs.current = run.start(chords.length * 4, (i, t) => {
      if (i % 4 === 0) {
        const ch = chords[i / 4];
        window.setTimeout(() => setBar(i / 4), Math.max(0, (t - (getCtx()?.currentTime ?? 0)) * 1000));
        if (withBass) INSTRUMENTS.basse([toMidi(ch.root, 2)], t, (60 / bpm) * 3.8, 0.9);
      }
    }, () => { setBar(-1); finish(); });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">Grille
          <select value={progIdx} onChange={(e) => setProgIdx(Number(e.target.value))} className="block rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit">
            {PROGRESSIONS.map((p, i) => <option key={p.nom} value={i}>{p.nom}</option>)}
          </select>
        </label>
        <label className="text-sm">Tonalité
          <select value={key} onChange={(e) => setKey(e.target.value)} className="block rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit">
            {KEYS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </label>
        <label className="text-sm">Tempo : {bpm} BPM
          <input type="range" min={40} max={140} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="block w-40" />
        </label>
        <label className="text-sm"><input type="checkbox" checked={withBass} onChange={(e) => setWithBass(e.target.checked)} /> Basse virtuelle</label>
      </div>
      <p className="text-sm opacity-80">Plaque chaque accord sur le 1er temps de sa mesure (4 temps par accord), après 4 temps de décompte. La basse virtuelle joue la fondamentale : ta main gauche n’a pas besoin de la doubler.</p>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {chords.map((c, i) => (
          <li key={i} className={`rounded-xl border p-4 text-center text-2xl font-semibold ${bar === i ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{c.symbol}</li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        {!run.running ? <button type="button" className={btnMain} onClick={go}>▶ Démarrer</button> : <button type="button" className={btnSec} onClick={run.stop}>■ Arrêter</button>}
        <span className="text-xl tabular-nums">{run.running && run.beat < 0 ? `Décompte ${run.beat + 5}` : ''}</span>
      </div>
      <Result ok={res.ok} lines={res.lines} />
    </div>
  );
}

// ---------------------------------------------------------------- Micro
function MicExercise() {
  const [target, setTarget] = useState(() => 48 + Math.floor(Math.random() * 20));
  const [detected, setDetected] = useState<{ midi: number; cents: number } | null>(null);
  const [on, setOn] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => () => stopRef.current(), []);

  const start = async () => {
    setError('');
    setOk(null);
    const c = getCtx();
    if (!c || !navigator.mediaDevices?.getUserMedia) { setError('Micro indisponible dans ce navigateur.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
      const src = c.createMediaStreamSource(stream);
      const an = c.createAnalyser();
      an.fftSize = 4096;
      src.connect(an);
      const buf = new Float32Array(an.fftSize);
      let goodSince = 0;
      let raf = 0;
      const loop = () => {
        an.getFloatTimeDomainData(buf);
        const hz = detectPitch(buf, c.sampleRate, 70, 1000);
        if (hz) {
          const midi = Math.round(hzToMidi(hz));
          const cents = Math.round(centsOff(hz, target));
          setDetected({ midi, cents });
          if (Math.abs(cents) <= 30) {
            goodSince = goodSince || performance.now();
            if (performance.now() - goodSince > 600) {
              setOk(true);
              recordExercise({ exercise: 'micro-note', justesse: 100, ecartMs: null, regularite: null, reussi: true });
              stopRef.current();
              return;
            }
          } else goodSince = 0;
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
      setOn(true);
      stopRef.current = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); src.disconnect(); setOn(false); };
    } catch {
      setError('Accès au micro refusé. Autorise le micro dans le navigateur pour cet exercice.');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm opacity-80">Mode simplifié : joue ou chante <strong>une seule note</strong>. L’app écoute au micro et valide quand tu tiens la note à ±30 cents pendant 0,6 s. Un clavier MIDI reste plus précis pour les accords.</p>
      <div className="rounded-2xl border border-black/10 p-5 text-center dark:border-white/10">
        <p className="text-sm opacity-70">Note cible</p>
        <p className="font-serif text-5xl font-semibold text-or">{midiName(target, true)}</p>
        {detected && on && (
          <p className="mt-2 text-lg tabular-nums">
            Entendu : {midiName(detected.midi, true)} · {detected.cents > 0 ? '+' : ''}{detected.cents} cents {Math.abs(detected.cents) <= 30 ? '✓' : detected.cents > 0 ? '(trop haut)' : '(trop bas)'}
          </p>
        )}
      </div>
      <Keyboard from={48} octaves={2} active={[target]} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnSec} onClick={() => playNotes([target], 1.5)}>▶ Écouter la note</button>
        {!on ? <button type="button" className={btnMain} onClick={start}>🎤 Écouter au micro</button> : <button type="button" className={btnSec} onClick={() => stopRef.current()}>■ Couper le micro</button>}
        <button type="button" className={btnSec} onClick={() => { stopRef.current(); setTarget(48 + Math.floor(Math.random() * 20)); setOk(null); setDetected(null); }}>Note suivante →</button>
      </div>
      {error && <p className="rounded-xl bg-bordeaux/15 p-3 text-sm">{error}</p>}
      <Result ok={ok} lines={ok ? ['Note tenue juste.'] : []} />
    </div>
  );
}

// ---------------------------------------------------------------- Page
export default function ExercisesPage() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get('type') as Tab) || 'accords');
  const [palier, setPalier] = useState<Palier>((Number(params.get('palier')) as Palier) || 1);
  const handler = useRef<((e: MidiEvent) => void) | null>(null);
  const listen = useCallback((h: ((e: MidiEvent) => void) | null) => { handler.current = h; }, []);
  const midi = useMidiInput((e) => {
    if (e.on) INSTRUMENTS.piano([e.note], (getCtx()?.currentTime ?? 0) + 0.005, 0.8, e.velocity / 127);
    handler.current?.(e);
  });
  void getAnalyser;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">S’entraîner</h1>
        <p className="text-sm opacity-80">
          Clavier MIDI : <strong>{midi.status}</strong>{midi.device ? ` (${midi.device})` : ''}. Sans clavier MIDI, touche les notes à l’écran.
          {midi.status === 'indisponible' && ' Web MIDI fonctionne dans Chrome, Edge et Opera (ordinateur et Android).'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => setTab(id)}
            className={`rounded-full border px-4 py-2 text-sm ${tab === id ? 'border-or bg-or/20 font-semibold' : 'border-black/10 dark:border-white/10'}`}>{label}</button>
        ))}
      </div>
      {tab !== 'micro' && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>Palier :</span>
          {([1, 2, 3] as Palier[]).map((p) => (
            <button key={p} type="button" onClick={() => setPalier(p)}
              className={`rounded-full border px-3 py-1 ${palier === p ? 'border-or bg-or/20 font-semibold' : 'border-black/10 dark:border-white/10'}`}>
              {p === 1 ? '🟢 Découverte' : p === 2 ? '🟡 Maîtrise' : '🔴 Virtuose'}
            </button>
          ))}
        </div>
      )}
      {tab === 'accords' && <ChordExercise key={`a${palier}`} palier={palier} listen={listen} />}
      {tab === 'gammes' && <ScaleExercise key={`g${palier}`} palier={palier} listen={listen} />}
      {tab === 'progression' && <ProgressionExercise key={`p${palier}`} palier={palier} listen={listen} />}
      {tab === 'micro' && <MicExercise />}
    </section>
  );
}
