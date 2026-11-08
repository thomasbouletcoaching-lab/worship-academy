import { useMemo, useState } from 'react';
import { parseNote, toMidi, noteName, Note } from '../../theory/notes';
import { buildChord, closeVoicing, dropVoicing, drop24Voicing, QUALITIES, invertNotes } from '../../theory/chords';
import { playNotes } from '../../audio/synth';

const ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const QUALITY_KEYS = Object.keys(QUALITIES);

const midiName = (m: number) => {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return `${names[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
};

export default function ChordDictionary() {
  const [root, setRoot] = useState('C');
  const [quality, setQuality] = useState('maj7');
  const [inversion, setInversion] = useState(0);

  const data = useMemo(() => {
    const chord = buildChord(parseNote(root), quality);
    const notes: Note[] = invertNotes(chord, inversion);
    const bass = toMidi(notes[0], 3);
    const close = closeVoicing(notes, bass);
    const drop2 = dropVoicing(close, 2);
    const drop3 = dropVoicing(close, 3);
    const drop24 = chord.notes.length >= 4 ? drop24Voicing(close) : null;
    return { chord, notes, close, drop2, drop3, drop24 };
  }, [root, quality, inversion]);

  const voicings: [string, number[] | null][] = [
    ['Position serrée', data.close],
    ['Drop 2', data.drop2],
    ['Drop 3', data.drop3],
    ['Drop 2-4', data.drop24],
  ];

  return (
    <section className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Dictionnaire d'accords</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Fondamentale
          <select className="rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit" value={root} onChange={(e) => { setRoot(e.target.value); setInversion(0); }}>
            {ROOTS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Qualité
          <select className="rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit" value={quality} onChange={(e) => { setQuality(e.target.value); setInversion(0); }}>
            {QUALITY_KEYS.map((q) => <option key={q} value={q}>{QUALITIES[q].symbol || 'maj'} · {QUALITIES[q].name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Renversement
          <select className="rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit" value={inversion} onChange={(e) => setInversion(Number(e.target.value))}>
            {data.chord.notes.map((_, i) => <option key={i} value={i}>{i === 0 ? 'Fondamentale' : `${i}er/${i}e renversement`}</option>)}
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
        <p className="text-xl font-semibold">{data.chord.name} <span className="text-sm opacity-60">({data.chord.symbol})</span></p>
        <p className="mt-1 text-sm">Notes : {data.chord.notes.map((n) => noteName(n)).join(' · ')}</p>
        <button type="button" className="mt-3 rounded-lg bg-or px-3 py-2 text-sm font-semibold text-nuit" onClick={() => playNotes(data.close)}>
          ▶ Écouter (position serrée)
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {voicings.map(([label, midis]) => (
          <div key={label} className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <p className="font-medium">{label}</p>
            {midis ? (
              <>
                <p className="mt-1 font-mono text-sm">{midis.map(midiName).join(' ')}</p>
                <button type="button" className="mt-2 text-sm text-or underline" onClick={() => playNotes(midis)}>Écouter</button>
              </>
            ) : (
              <p className="mt-1 text-sm opacity-60">Non disponible pour un accord à 3 sons.</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs opacity-60">C4 = Do central. Les voicings sont calculés par le moteur de théorie, testé.</p>
    </section>
  );
}
