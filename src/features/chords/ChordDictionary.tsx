import { useMemo, useState } from 'react';
import { parseNote, toMidi, noteName, Note, pc } from '../../theory/notes';
import { buildChord, closeVoicing, dropVoicing, drop24Voicing, QUALITIES, invertNotes, shellVoicing, rootlessA, rootlessB, quartalStack } from '../../theory/chords';
import { voiceLead, movement, commonTones } from '../../theory/voiceLeading';
import { midiName } from '../../theory/pitch';
import { playNotes, playSequence, SoundName } from '../../audio/synth';
import { Keyboard, rangeFor } from '../keyboard/keyboard';
import { useMidiInput } from '../midi/useMidiInput';

const ROOTS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const sel = 'w-full rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit';

/** Empile des notes au-dessus d'une hauteur de départ (chaque note au-dessus de la précédente). */
function stackFrom(notes: Note[], start: number): number[] {
  return closeVoicing(notes, start + ((pc(notes[0]) - start) % 12 + 12) % 12);
}

interface V { nom: string; notes: number[] | null; aide: string; }

export default function ChordDictionary() {
  const [root, setRoot] = useState('C');
  const [quality, setQuality] = useState('maj7');
  const [inversion, setInversion] = useState(0);
  const [nextRoot, setNextRoot] = useState('F');
  const [nextQ, setNextQ] = useState('maj7');
  const [sound, setSound] = useState<SoundName>('piano');
  const [shown, setShown] = useState<number[] | null>(null);
  const midi = useMidiInput();

  const chord = useMemo(() => buildChord(parseNote(root), quality), [root, quality]);
  const voicings: V[] = useMemo(() => {
    const inv = invertNotes(chord, inversion);
    const close = closeVoicing(inv, toMidi(inv[0], 4) > 67 ? toMidi(inv[0], 3) : toMidi(inv[0], 4));
    const four = chord.notes.length >= 4;
    const ninth = chord.degrees.includes(9);
    const rA = rootlessA(chord);
    const rB = rootlessB(chord);
    return [
      { nom: 'Position serrée', notes: close, aide: 'Toutes les notes dans moins d’une octave. Compact, idéal pour apprendre l’accord.' },
      { nom: 'Drop 2', notes: four ? dropVoicing(close, 2) : null, aide: '2e note depuis le haut descendue d’une octave : son de chorale, ouvert.' },
      { nom: 'Drop 3', notes: four ? dropVoicing(close, 3) : null, aide: '3e note depuis le haut descendue : plus large, grave profond, pour les ballades.' },
      { nom: 'Drop 2-4', notes: four ? drop24Voicing(close) : null, aide: '2e et 4e descendues : très ouvert, effet orchestral sur deux mains.' },
      { nom: 'Shell (1-3-7)', notes: four ? stackFrom(shellVoicing(chord), toMidi(chord.root, 3)) : null, aide: 'Fondamentale, tierce, septième : l’ossature. Main gauche typique du piano seul.' },
      { nom: 'Rootless A (3-5-7-9)', notes: ninth && rA.length >= 4 ? stackFrom(rA, 52) : null, aide: 'Sans fondamentale (le bassiste la joue) : 3-5-7-9, de E3 à environ G4.' },
      { nom: 'Rootless B (7-9-3-5 / 3-7-9-13)', notes: ninth && rB.length >= 3 ? stackFrom(rB, 52) : null, aide: 'Autre ordre des mêmes couleurs : alterne A et B pour enchaîner sans sauter.' },
      { nom: 'Quartal (quartes empilées)', notes: stackFrom(quartalStack(parseNote(root), 4), toMidi(parseNote(root), 3)), aide: 'Quartes justes sur la fondamentale : son moderne, ouvert, sans tierce. À utiliser selon le contexte.' },
    ];
  }, [chord, inversion, root]);

  const nextChord = useMemo(() => buildChord(parseNote(nextRoot), nextQ), [nextRoot, nextQ]);
  const from = voicings[0].notes!;
  const led = useMemo(() => voiceLead(from, nextChord, 52, 81), [from, nextChord]);
  const cost = movement(from, led);
  const common = commonTones(from, led);

  const display = shown ?? (midi.active.length ? midi.active : voicings[0].notes!);
  const r = rangeFor(display, 3);

  const show = (notes: number[]) => { setShown(notes); playNotes(notes, 1.8, 0, sound); };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Dictionnaire d’accords et de voicings</h1>
        <p className="text-sm opacity-80">Tout accord, dans les 12 tonalités, calculé par le moteur de théorie. Clavier MIDI : {midi.status}.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-sm">Fondamentale
          <select className={sel} value={root} onChange={(e) => { setRoot(e.target.value); setInversion(0); setShown(null); }}>{ROOTS.map((x) => <option key={x}>{x}</option>)}</select>
        </label>
        <label className="text-sm">Qualité
          <select className={sel} value={quality} onChange={(e) => { setQuality(e.target.value); setInversion(0); setShown(null); }}>
            {Object.keys(QUALITIES).map((q) => <option key={q} value={q}>{QUALITIES[q].symbol || 'maj'} · {QUALITIES[q].name}</option>)}
          </select>
        </label>
        <label className="text-sm">Renversement
          <select className={sel} value={inversion} onChange={(e) => { setInversion(Number(e.target.value)); setShown(null); }}>
            {chord.notes.map((n, i) => <option key={i} value={i}>{i === 0 ? 'Fondamental' : `${i === 1 ? '1er' : `${i}e`} (basse ${noteName(n)})`}</option>)}
          </select>
        </label>
        <label className="text-sm">Son
          <select className={sel} value={sound} onChange={(e) => setSound(e.target.value as SoundName)}>
            {(['piano', 'rhodes', 'orgue', 'pad', 'cordes'] as SoundName[]).map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
        <p className="font-serif text-3xl font-semibold text-or">{chord.symbol}</p>
        <p className="text-sm">{chord.name} · notes : <strong>{chord.notes.map(noteName).join(' – ')}</strong> · degrés : {chord.degrees.join(' – ')}</p>
      </div>

      <Keyboard from={r.from} octaves={r.octaves} active={display} showNames onKey={(m) => playNotes([m], 0.8, 0, sound)} />
      <p className="text-center font-mono text-sm">{display.map((m) => midiName(m, true)).join(' ')}</p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {voicings.map((v) => (
          <li key={v.nom} className="rounded-xl border border-black/10 p-3 dark:border-white/10">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="font-semibold">{v.nom}</p>
                <p className="font-mono text-sm">{v.notes ? v.notes.map((m) => midiName(m, true)).join(' ') : '—'}</p>
                <p className="mt-1 text-xs opacity-75">{v.notes ? v.aide : 'Pour les accords à 4 sons (ou avec 9e pour les rootless).'}</p>
              </div>
              {v.notes && (
                <span className="flex flex-col gap-1">
                  <button type="button" className="rounded-lg border border-black/15 px-2 py-1 text-sm dark:border-white/20" onClick={() => show(v.notes!)}>▶</button>
                  <button type="button" aria-label="Arpège" className="rounded-lg border border-black/15 px-2 py-1 text-sm dark:border-white/20" onClick={() => { setShown(v.notes!); playSequence(v.notes!, 0.3, 0.9, sound); }}>⋯</button>
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-3 rounded-2xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="font-semibold">Voice leading vers l’accord suivant</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Accord suivant
            <select className={sel} value={nextRoot} onChange={(e) => setNextRoot(e.target.value)}>{ROOTS.map((x) => <option key={x}>{x}</option>)}</select>
          </label>
          <label className="text-sm">Qualité
            <select className={sel} value={nextQ} onChange={(e) => setNextQ(e.target.value)}>{Object.keys(QUALITIES).map((q) => <option key={q} value={q}>{QUALITIES[q].symbol || 'maj'}</option>)}</select>
          </label>
        </div>
        <p className="text-sm">
          <strong>{chord.symbol}</strong> {from.map((m) => midiName(m, true)).join(' ')} → <strong>{nextChord.symbol}</strong> {led.map((m) => midiName(m, true)).join(' ')}
        </p>
        <p className="text-sm opacity-80">
          Mouvement total : {cost} demi-ton(s). {common.length ? `Note(s) commune(s) gardée(s) : ${[...new Set(common.map((m) => midiName(m, true)))].join(', ')}.` : 'Aucune note commune : déplace chaque voix au plus court.'}
        </p>
        <button type="button" className="rounded-lg bg-or px-3 py-2 text-sm font-semibold text-nuit" onClick={() => { show(from); window.setTimeout(() => show(led), 1300); }}>▶ Écouter l’enchaînement</button>
      </div>
    </section>
  );
}
