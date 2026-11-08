import { useEffect, useState } from 'react';
import { playNotes, click, kick } from '../../audio/synth';
import { Chart, barToChords } from '../nashville/nashville';
import { toMidi } from '../../theory/notes';
import { closeVoicing } from '../../theory/chords';

// Grille de démonstration originale (aucune chanson protégée).
export const DEMO: Chart = {
  title: 'Progression de démonstration',
  key: 'G',
  bpm: 76,
  sections: [
    { name: 'Couplet', bars: ['1', '6m', '4', '5'] },
    { name: 'Refrain', bars: ['4', '5', '1', '1'] },
  ],
};

const FLAT_BARS = DEMO.sections.flatMap((s) => s.bars);

export default function VirtualBand() {
  const [bpm, setBpm] = useState(DEMO.bpm);
  const [key, setKey] = useState(DEMO.key);
  const [playing, setPlaying] = useState(false);
  const [bass, setBass] = useState(true);
  const [pad, setPad] = useState(true);
  const [metro, setMetro] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const beatMs = 60000 / bpm;
    let beat = 0;
    let bar = 0;
    const tick = () => {
      if (metro) click(beat === 0);
      if (beat === 0) {
        const idx = bar % FLAT_BARS.length;
        setCurrent(idx);
      
        // Chaque mesure contient des chiffres : on joue le premier accord de la mesure.
        const chord = barToChords(key, FLAT_BARS[idx])[0];
        if (chord) {
          const midis = closeVoicing(chord.notes, toMidi(chord.notes[0], 4));
          const barSec = (beatMs * 4) / 1000;
          if (pad) playNotes(midis, barSec, 0);
          if (bass) {
            kick();
            playNotes([toMidi(chord.root, 2)], barSec, 0);
          }
        }
        bar++;
      }
      beat = (beat + 1) % 4;
    };
    tick();
    const id = window.setInterval(tick, beatMs);
    return () => window.clearInterval(id);
  }, [playing, bpm, key, bass, pad, metro]);

  return (
    <section className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Groupe virtuel</h1>
      <p className="max-w-2xl text-sm opacity-80">
        Démo de principe : métronome, basse et pad suivent une grille en degrés. Coupe un instrument pour entendre sa place.
        La section complète (batterie, guitare, cordes) viendra dans une version ultérieure.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm">Tempo : {bpm} BPM
          <input type="range" min={50} max={120} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-full" />
        </label>
        <label className="text-sm">Tonalité
          <select className="w-full rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit" value={key} onChange={(e) => setKey(e.target.value)}>
            {['C', 'D', 'Eb', 'E', 'F', 'G', 'A', 'Bb'].map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-3 self-end text-sm">
          <label><input type="checkbox" checked={metro} onChange={(e) => setMetro(e.target.checked)} /> Métronome</label>
          <label><input type="checkbox" checked={bass} onChange={(e) => setBass(e.target.checked)} /> Basse</label>
          <label><input type="checkbox" checked={pad} onChange={(e) => setPad(e.target.checked)} /> Pad</label>
        </div>
      </div>
      <button type="button" onClick={() => setPlaying((p) => !p)} className="rounded-lg bg-or px-4 py-2 font-semibold text-nuit">
        {playing ? '■ Arrêter' : '▶ Lancer'}
      </button>
      <ol className="flex flex-wrap gap-2 text-sm">
        {FLAT_BARS.map((b, i) => (
          <li key={i} className={`rounded-md border px-3 py-2 ${playing && current === i ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>
            {barToChords(key, b).map((c) => c.symbol).join(' ')}
          </li>
        ))}
      </ol>
    </section>
  );
}
