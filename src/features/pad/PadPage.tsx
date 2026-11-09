import { useEffect, useRef, useState } from 'react';
import { startPad } from '../../audio/synth';
import { setBusLevel, getCtx, bus } from '../../audio/engine';
import { buildChord } from '../../theory/chords';
import { parseNote, toMidi, pc } from '../../theory/notes';

// Pad de louange : une nappe tenue dans n'importe quelle tonalité, pour la prière et les transitions.
const ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const COLORS: [string, string, string][] = [
  ['quinte', 'Quinte (1-5)', 'Neutre : ni majeur ni mineur, passe sous tous les accords du chant.'],
  ['sus2', 'Sus2', 'Ouvert, suspendu : idéal pendant une prière.'],
  ['maj', 'Majeur', 'Clair et stable.'],
  ['add9', 'Add9', 'Lumineux, moderne.'],
  ['maj7', 'Majeur 7', 'Doux, intime.'],
  ['min', 'Mineur', 'Recueilli : repentance, attente.'],
];
const SOUNDS: ['pad' | 'cordes' | 'orgue', string][] = [['pad', 'Nappe'], ['cordes', 'Cordes'], ['orgue', 'Orgue']];

/** Voicing large : fondamentale grave + quinte + couleur au médium. */
export function padVoicing(root: string, color: string): number[] {
  const r = parseNote(root);
  const low = toMidi(r, 2) < 38 ? toMidi(r, 3) : toMidi(r, 2);
  if (color === 'quinte') return [low, low + 7, low + 12, low + 19];
  const c = buildChord(r, color === 'min' ? 'min' : color);
  const upper = c.notes.map(pc).map((p) => { let m = low + 12; while (m % 12 !== p) m++; return m; });
  return [low, low + 7, ...new Set(upper)].sort((a, b) => a - b);
}

export default function PadPage() {
  const [root, setRoot] = useState('C');
  const [color, setColor] = useState('quinte');
  const [sound, setSound] = useState<'pad' | 'cordes' | 'orgue'>('pad');
  const [on, setOn] = useState(false);
  const [vol, setVol] = useState(80);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!on) return;
    stopRef.current = startPad(padVoicing(root, color), sound);
    return () => { stopRef.current?.(); stopRef.current = null; };
  }, [on, root, color, sound]);

  useEffect(() => { setBusLevel(sound, vol / 100); }, [vol, sound]);

  const swell = (target: number) => {
    const c = getCtx(); const b = bus(sound); if (!c || !b) return;
    b.gain.cancelScheduledValues(c.currentTime);
    b.gain.setValueAtTime(b.gain.value, c.currentTime);
    b.gain.linearRampToValueAtTime(target / 100, c.currentTime + 4);
    setVol(target);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Pad de louange</h1>
        <p className="text-sm opacity-80">Une nappe tenue pour la prière, les transitions et les temps spontanés. Change de tonalité ou de couleur sans couper : le son passe en fondu enchaîné.</p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {ROOTS.map((r) => (
          <button key={r} type="button" onClick={() => setRoot(r)} aria-pressed={r === root}
            className={`rounded-xl border py-4 text-xl font-semibold ${r === root ? 'border-or bg-or/25' : 'border-black/10 dark:border-white/10'}`}>{r}</button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {COLORS.map(([k, label, desc]) => (
          <button key={k} type="button" onClick={() => setColor(k)} aria-pressed={k === color}
            className={`rounded-xl border p-3 text-left ${k === color ? 'border-or bg-or/15' : 'border-black/10 dark:border-white/10'}`}>
            <span className="block font-semibold">{label}</span><span className="block text-xs opacity-75">{desc}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {SOUNDS.map(([s, l]) => (
          <button key={s} type="button" onClick={() => setSound(s)} className={`rounded-full border px-4 py-2 text-sm ${s === sound ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{l}</button>
        ))}
      </div>
      <button type="button" onClick={() => setOn((v) => !v)} className={`w-full rounded-2xl px-6 py-5 text-xl font-semibold ${on ? 'border border-or bg-transparent' : 'bg-or text-nuit'}`}>
        {on ? '■ Couper la nappe (fondu)' : '▶ Lancer la nappe'}
      </button>
      <div className="space-y-2">
        <label className="block text-sm">Volume : {vol} %
          <input type="range" min={0} max={100} value={vol} onChange={(e) => setVol(Number(e.target.value))} className="block w-full" />
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => swell(100)} className="flex-1 rounded-xl border border-black/15 py-3 dark:border-white/20">⬆ Swell (monter en 4 s)</button>
          <button type="button" onClick={() => swell(35)} className="flex-1 rounded-xl border border-black/15 py-3 dark:border-white/20">⬇ Redescendre</button>
        </div>
      </div>
      <p className="text-xs opacity-60">Conseil : la quinte seule passe sous n’importe quel accord du chant. Garde le pad sous la voix du pasteur ; c’est un tapis, pas une mélodie.</p>
    </section>
  );
}
