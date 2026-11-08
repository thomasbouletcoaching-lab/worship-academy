import { useEffect, useRef, useState } from 'react';
import { startPad } from '../../audio/synth';
import { buildChord, closeVoicing } from '../../theory/chords';
import { parseNote, toMidi } from '../../theory/notes';

// Pad de louange : une nappe tenue dans n'importe quelle tonalité, pour la prière.
const ROOTS = ['C', 'D', 'Eb', 'E', 'F', 'G', 'A', 'Bb'];
const QUALITIES: [string, string][] = [['maj', 'Majeur'], ['maj7', 'Majeur 7'], ['sus2', 'Sus2'], ['add9', 'Add9'], ['m7', 'Mineur 7']];

export default function PadPage() {
  const [root, setRoot] = useState('C');
  const [quality, setQuality] = useState('maj7');
  const [on, setOn] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const chord = buildChord(parseNote(root), quality);
  const midis = closeVoicing(chord.notes, toMidi(chord.notes[0], 3));

  useEffect(() => {
    if (!on) return;
    stopRef.current = startPad(midis);
    return () => {
      stopRef.current?.();
      stopRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, root, quality]);

  return (
    <section className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Pad de louange</h1>
      <p className="max-w-2xl text-sm opacity-80">
        Une nappe tenue pendant la prière. Lance-la, change d'accord sans couper le son : elle est conçue pour le dimanche.
      </p>
      <div className="flex flex-wrap gap-2">
        {ROOTS.map((r) => (
          <button key={r} type="button" onClick={() => setRoot(r)}
            className={`rounded-lg border px-3 py-1 text-sm ${r === root ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{r}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {QUALITIES.map(([k, label]) => (
          <button key={k} type="button" onClick={() => setQuality(k)}
            className={`rounded-lg border px-3 py-1 text-sm ${k === quality ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{label}</button>
        ))}
      </div>
      <button type="button" onClick={() => setOn((v) => !v)} className="rounded-lg bg-or px-5 py-3 font-semibold text-nuit">
        {on ? '■ Couper la nappe' : '▶ Lancer la nappe'}
      </button>
      <p className="text-sm">Accord : {chord.symbol} ({chord.notes.map((n) => n.letter + (n.acc === 1 ? '#' : n.acc === -1 ? 'b' : '')).join(' ')})</p>
    </section>
  );
}
