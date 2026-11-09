import { useEffect, useMemo, useRef, useState } from 'react';
import { analyzeMix, BANDS } from './mix';
import { midiToHz, midiName } from '../../theory/pitch';
import { INSTRUMENTS, getCtx, getAnalyser } from '../../audio/engine';

// Situations types : la même harmonie (C) disposée bien ou mal.
const SCENARIOS: { nom: string; basse: number[]; mg: number[]; md: number[]; voix: number[] }[] = [
  { nom: '✅ Groupe : la basse a le grave, voicing au médium', basse: [36], mg: [52, 59], md: [64, 67, 72], voix: [76, 79] },
  { nom: '❌ La main gauche double la basse', basse: [36], mg: [36, 48], md: [64, 67, 72], voix: [76, 79] },
  { nom: '❌ Accord serré dans le grave (boue)', basse: [36], mg: [48, 52, 55], md: [60, 64], voix: [76, 79] },
  { nom: '❌ Piano au-dessus du chanteur', basse: [36], mg: [52, 59], md: [76, 79, 84], voix: [72, 74] },
  { nom: '✅ Piano seul : fondamentale grave + drop 2', basse: [], mg: [36, 43], md: [64, 67, 72], voix: [76] },
];

const LOG_MIN = Math.log10(30);
const LOG_MAX = Math.log10(16000);
const xOf = (hz: number) => ((Math.log10(Math.max(30, Math.min(16000, hz))) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100;

const ROWS: { key: 'basse' | 'mg' | 'md' | 'voix'; label: string; color: string }[] = [
  { key: 'voix', label: 'Voix', color: '#3b6ea5' },
  { key: 'md', label: 'Main droite', color: '#c9a24a' },
  { key: 'mg', label: 'Main gauche', color: '#d08a3a' },
  { key: 'basse', label: 'Basse', color: '#5f9e6e' },
];

function parseNotes(s: string): number[] {
  return s.split(/[\s,]+/).filter(Boolean).map((t) => {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(t);
    if (!m) return NaN;
    const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    return (Number(m[3]) + 1) * 12 + base[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }).filter(Number.isFinite);
}

export default function FrequencesPage() {
  const [sc, setSc] = useState(0);
  const [parts, setParts] = useState(() => ({ ...SCENARIOS[0] }));
  const [text, setText] = useState(() => ({ basse: '', mg: '', md: '', voix: '' }));
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const s = SCENARIOS[sc];
    setParts({ ...s });
    setText({ basse: s.basse.map((m) => midiName(m, true)).join(' '), mg: s.mg.map((m) => midiName(m, true)).join(' '), md: s.md.map((m) => midiName(m, true)).join(' '), voix: s.voix.map((m) => midiName(m, true)).join(' ') });
  }, [sc]);

  const findings = useMemo(() => analyzeMix(parts.basse, parts.mg, parts.md, parts.voix), [parts]);

  const play = () => {
    const c = getCtx(); if (!c) return;
    const t = c.currentTime + 0.05;
    if (parts.basse.length) INSTRUMENTS.basse(parts.basse, t, 2.5, 0.9);
    if (parts.mg.length || parts.md.length) INSTRUMENTS.piano([...parts.mg, ...parts.md], t, 2.5, 0.75);
    if (parts.voix.length) INSTRUMENTS.cordes(parts.voix, t + 0.1, 2.3, 0.7);
    setLive(true);
    window.setTimeout(() => setLive(false), 3200);
  };

  // Spectre en direct pendant l'écoute.
  useEffect(() => {
    if (!live) return;
    const an = getAnalyser(); const cv = canvas.current; const c = getCtx();
    if (!an || !cv || !c) return;
    const g = cv.getContext('2d')!;
    const data = new Uint8Array(an.frequencyBinCount);
    let raf = 0;
    const draw = () => {
      an.getByteFrequencyData(data);
      g.clearRect(0, 0, cv.width, cv.height);
      g.fillStyle = '#c9a24a';
      for (let i = 1; i < data.length; i++) {
        const hz = (i * c.sampleRate) / an.fftSize;
        if (hz < 30 || hz > 16000) continue;
        const x = (xOf(hz) / 100) * cv.width;
        const h = (data[i] / 255) * cv.height;
        g.fillRect(x, cv.height - h, 2, h);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [live]);

  const setPart = (k: keyof typeof text, v: string) => {
    setText((t) => ({ ...t, [k]: v }));
    setParts((p) => ({ ...p, [k]: parseNotes(v) }));
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Où se place la musique ?</h1>
        <p className="text-sm opacity-80">Chaque note a une fréquence. Quand deux instruments occupent la même zone, on les entend moins bien. Choisis une situation ou écris tes propres notes (ex. « C2 », « E3 B3 »).</p>
      </div>
      <select aria-label="Situation" value={sc} onChange={(e) => setSc(Number(e.target.value))} className="w-full rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit">
        {SCENARIOS.map((s, i) => <option key={s.nom} value={i}>{s.nom}</option>)}
      </select>

      <div className="space-y-1">
        <div className="relative h-6 w-full overflow-hidden rounded">
          {BANDS.map((b) => <div key={b.label} title={b.label} className="absolute top-0 h-full opacity-30" style={{ left: `${xOf(b.from)}%`, width: `${xOf(b.to) - xOf(b.from)}%`, background: b.color }} />)}
        </div>
        {ROWS.map((r) => (
          <div key={r.key} className="relative h-9 w-full rounded border border-black/5 dark:border-white/5">
            <span className="absolute left-1 top-1 text-[10px] opacity-60">{r.label}</span>
            {parts[r.key].map((m) => (
              <span key={m} className="absolute top-3 -translate-x-1/2 rounded px-1 text-[10px] font-semibold text-white" style={{ left: `${xOf(midiToHz(m))}%`, background: r.color }} title={`${midiName(m, true)} · ${Math.round(midiToHz(m))} Hz`}>
                {midiName(m, true)}
              </span>
            ))}
          </div>
        ))}
        <div className="flex justify-between text-[10px] opacity-60"><span>30 Hz</span><span>100</span><span>250</span><span>500</span><span>1 k</span><span>2 k</span><span>5 k</span><span>16 k</span></div>
        <canvas ref={canvas} width={800} height={80} className="h-16 w-full rounded bg-black/5 dark:bg-white/5" aria-label="Spectre en direct" />
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        {ROWS.map((r) => (
          <label key={r.key} className="text-sm">{r.label}
            <input value={text[r.key]} onChange={(e) => setPart(r.key, e.target.value)} className="block w-full rounded-lg border border-black/15 bg-transparent p-2 font-mono dark:border-white/20" />
          </label>
        ))}
      </div>
      <button type="button" onClick={play} className="rounded-xl bg-or px-5 py-3 font-semibold text-nuit">▶ Écouter cette disposition</button>

      <ul className="space-y-2">
        {findings.map((f) => (
          <li key={f.message} className={`rounded-xl p-3 text-sm ${f.niveau === 'ok' ? 'bg-sauge/20' : f.niveau === 'attention' ? 'bg-or/15' : 'bg-bordeaux/15'}`}>
            {f.niveau === 'ok' ? '✅' : f.niveau === 'attention' ? '⚠️' : '❌'} {f.message}
          </li>
        ))}
      </ul>

      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {BANDS.map((b) => (
          <li key={b.label} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
            <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: b.color }} />
            <strong>{b.label}</strong> · {b.from}–{b.to} Hz
          </li>
        ))}
      </ul>
    </section>
  );
}
