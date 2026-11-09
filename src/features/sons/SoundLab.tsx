import { useRef, useState } from 'react';
import { INSTRUMENTS, ORGAN_PRESETS, DRAWBAR_LABELS, organSettings, setOrgan, getCtx, Release, OrganSettings } from '../../audio/engine';
import { Keyboard } from '../keyboard/keyboard';
import { useMidiInput } from '../midi/useMidiInput';
import { barToChartChords } from '../nashville/nashville';
import { voiceLead } from '../../theory/voiceLeading';
import { closeVoicing } from '../../theory/chords';
import { toMidi } from '../../theory/notes';

type Sound = 'piano' | 'rhodes' | 'orgue' | 'pad' | 'cordes';
const SOUNDS: [Sound, string, string][] = [
  ['piano', 'Piano', 'Attaque nette, le son décroît : idéal pour le rythme et les arpèges.'],
  ['rhodes', 'Rhodes', 'Son de cloche chaud et rond : ballades, soul, couplets intimes.'],
  ['orgue', 'Orgue', 'Son tenu sans décroissance : il remplit, porte les montées et le gospel.'],
  ['pad', 'Pad', 'Nappe lente, sans attaque : prière, transitions, fond sous la parole.'],
  ['cordes', 'Cordes', 'Attaque douce, vibrato : élan des refrains, au-dessus du piano.'],
];
const PROG = ['1', '6m', '4', '5'];

function progressionVoicings(key: string): number[][] {
  let last: number[] = [];
  return PROG.map((tok) => {
    const c = barToChartChords(key, tok)[0].chord;
    last = last.length ? voiceLead(last, c, 55, 79) : closeVoicing(c.notes, toMidi(c.notes[0], 4));
    return last;
  });
}

export default function SoundLab() {
  const [org, setOrg] = useState<OrganSettings>({ ...organSettings });
  const [key, setKey] = useState('G');
  const [active, setActive] = useState<number[]>([]);
  const held = useRef(new Map<number, Release>());

  const applyOrgan = (patch: Partial<OrganSettings>) => { const next = { ...org, ...patch }; setOrg(next); setOrgan(next); };
  const noteOn = (m: number, vel = 100) => {
    const c = getCtx(); if (!c) return;
    held.current.get(m)?.(0.05);
    held.current.set(m, INSTRUMENTS.orgue([m], c.currentTime + 0.005, 120, vel / 127));
    setActive((a) => (a.includes(m) ? a : [...a, m]));
  };
  const noteOff = (m: number) => { held.current.get(m)?.(0.06); held.current.delete(m); setActive((a) => a.filter((x) => x !== m)); };
  const midi = useMidiInput((e) => (e.on ? noteOn(e.note, e.velocity) : noteOff(e.note)));

  const playProg = (sound: Sound, offset = 0) => {
    const c = getCtx(); if (!c) return;
    const beat = 60 / 72;
    progressionVoicings(key).forEach((v, i) => {
      const t = c.currentTime + 0.05 + offset + i * beat * 2;
      INSTRUMENTS[sound](v, t, beat * 2 - 0.05, 0.75);
      INSTRUMENTS.basse([toMidi(barToChartChords(key, PROG[i])[0].chord.root, 2)], t, beat * 2 - 0.1, 0.8);
    });
  };
  const playAll = () => SOUNDS.forEach(([s], i) => playProg(s, i * (60 / 72) * 8 + i * 0.4));

  return (
    <section className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Orgue et labo de sons</h1>
        <p className="text-sm opacity-80">Clavier MIDI : {midi.status}. Sans clavier, touche les notes à l’écran (une touche = une note tenue ; retouche pour relâcher).</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-or">Orgue Hammond (synthétisé)</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ORGAN_PRESETS).map(([name, bars]) => (
            <button key={name} type="button" onClick={() => applyOrgan({ drawbars: bars })}
              className={`rounded-full border px-3 py-1.5 text-sm ${org.drawbars.join('') === bars.join('') ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{name}</button>
          ))}
        </div>
        <div className="flex items-end justify-center gap-2 overflow-x-auto rounded-2xl bg-nuit p-4 text-ivoire" role="group" aria-label="Tirettes">
          {org.drawbars.map((v, i) => (
            <label key={i} className="flex flex-col items-center gap-1 text-xs">
              <span className="tabular-nums">{v}</span>
              <input type="range" min={0} max={8} value={v} aria-label={`Tirette ${DRAWBAR_LABELS[i]}`}
                onChange={(e) => applyOrgan({ drawbars: org.drawbars.map((x, j) => (j === i ? Number(e.target.value) : x)) })}
                style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 120, accentColor: i < 2 ? '#7a2e3a' : i === 2 || i === 3 || i === 5 || i === 8 ? '#f7f3ea' : '#0f1424' }} />
              <span>{DRAWBAR_LABELS[i]}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>Leslie :</span>
          {(['off', 'lent', 'rapide'] as const).map((l) => (
            <button key={l} type="button" onClick={() => applyOrgan({ leslie: l })} className={`rounded-full border px-3 py-1.5 ${org.leslie === l ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{l === 'off' ? 'Arrêt' : l === 'lent' ? 'Lent (chorale)' : 'Rapide (trémolo)'}</button>
          ))}
          <span className="ml-3">Percussion :</span>
          {(['off', '2nd', '3rd'] as const).map((p) => (
            <button key={p} type="button" onClick={() => applyOrgan({ percussion: p })} className={`rounded-full border px-3 py-1.5 ${org.percussion === p ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{p === 'off' ? 'Arrêt' : p === '2nd' ? '2e harmonique' : '3e harmonique'}</button>
          ))}
        </div>
        <Keyboard from={48} octaves={3} marks={Object.fromEntries(active.map((m) => [m, 'joue' as const]))} onKey={(m) => (held.current.has(m) ? noteOff(m) : noteOn(m))} />
        <p className="text-sm opacity-80">Astuce gospel : passe le Leslie en rapide sur la montée d’un refrain, puis reviens en lent pour la descente. Le moteur accélère et ralentit progressivement, comme un vrai cabinet.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-or">Comparer les sons sur la même grille</h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>Grille 1 – 6m – 4 – 5 en</span>
          <select value={key} onChange={(e) => setKey(e.target.value)} className="rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit">
            {['C', 'D', 'Eb', 'E', 'F', 'G', 'A', 'Bb'].map((k) => <option key={k}>{k}</option>)}
          </select>
          <button type="button" onClick={playAll} className="rounded-lg bg-or px-3 py-2 font-semibold text-nuit">▶ Tout enchaîner</button>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SOUNDS.map(([s, label, desc]) => (
            <li key={s} className="flex items-start gap-3 rounded-xl border border-black/10 p-3 dark:border-white/10">
              <button type="button" onClick={() => playProg(s)} className="rounded-lg border border-black/15 px-3 py-2 text-sm dark:border-white/20">▶ {label}</button>
              <p className="text-sm opacity-80">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
