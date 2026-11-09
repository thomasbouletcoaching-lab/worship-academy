import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { startScheduler, drums, clickAt, INSTRUMENTS, setBusLevel, InstrumentId } from '../../audio/engine';
import { getCharts, SavedChart } from '../nashville/charts';
import { barToChartChords, ChartChord } from '../nashville/nashville';
import { toMidi } from '../../theory/notes';
import { voiceLead } from '../../theory/voiceLeading';
import { closeVoicing } from '../../theory/chords';

// Grooves : 16 pas (doubles croches) par mesure de 4 temps. K = grosse caisse, S = caisse claire, H = charleston.
export const GROOVES: Record<string, { nom: string; K: number[]; S: number[]; H: number[]; basse: number[] }> = {
  ballade: { nom: 'Ballade (temps 1 et 3)', K: [0, 8], S: [], H: [0, 4, 8, 12], basse: [0, 8] },
  pop: { nom: 'Pop 4/4', K: [0, 6, 8], S: [4, 12], H: [0, 2, 4, 6, 8, 10, 12, 14], basse: [0, 6, 8] },
  rock: { nom: 'Louange enlevée', K: [0, 4, 8, 12], S: [4, 12], H: [2, 6, 10, 14], basse: [0, 2, 4, 6, 8, 10, 12, 14] },
  gospel: { nom: 'Gospel (shuffle léger)', K: [0, 10], S: [4, 12], H: [0, 3, 4, 7, 8, 11, 12, 15], basse: [0, 7, 8] },
  pad: { nom: 'Nappe seule (prière)', K: [], S: [], H: [], basse: [0] },
};

type Inst = 'batterie' | 'basse' | 'piano' | 'pad' | 'cordes' | 'clic';
const INST_LIST: [Inst, string][] = [['batterie', '🥁 Batterie'], ['basse', '🎸 Basse'], ['piano', '🎹 Piano'], ['pad', '🌫 Pad'], ['cordes', '🎻 Cordes'], ['clic', '⏱ Clic']];

interface FlatBar { section: string; sectionIdx: number; chords: ChartChord[]; }

export function flattenChart(chart: SavedChart, key: string): FlatBar[] {
  const out: FlatBar[] = [];
  chart.sections.forEach((s, si) => s.bars.forEach((b) => {
    let chords: ChartChord[] = [];
    try { chords = barToChartChords(key, b); } catch { /* mesure invalide : silence */ }
    out.push({ section: s.name, sectionIdx: si, chords });
  }));
  return out;
}

export default function VirtualBand() {
  const [params] = useSearchParams();
  const charts = useMemo(getCharts, []);
  const [chartId, setChartId] = useState(params.get('grille') ?? charts[0].id);
  const chart = charts.find((c) => c.id === chartId) ?? charts[0];
  const [key, setKey] = useState(params.get('cle') ?? chart.key);
  const [bpm, setBpm] = useState(chart.bpm);
  const [groove, setGroove] = useState(chart.bpm < 80 ? 'ballade' : 'pop');
  const [loop, setLoop] = useState<number | null>(null); // index de section bouclée
  const [mutes, setMutes] = useState<Record<Inst, boolean>>({ batterie: false, basse: false, piano: true, pad: false, cordes: true, clic: false });
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ bar: -1 });

  const bars = useMemo(() => flattenChart(chart, key), [chart, key]);
  const live = useRef({ bpm, groove, loop, bars });
  live.current = { bpm, groove, loop, bars };

  useEffect(() => { setKey(chart.key); setBpm(chart.bpm); setLoop(null); }, [chart]);
  useEffect(() => {
    (Object.keys(mutes) as Inst[]).forEach((i) => setBusLevel(i as InstrumentId, mutes[i] ? 0 : 1));
  }, [mutes]);

  useEffect(() => {
    if (!playing) return;
    let barIdx = -1;
    let lastVoicing: number[] = [];
    const stop = startScheduler(() => live.current.bpm, (step, t) => {
      const { groove: gName, loop: lp, bars: bs } = live.current;
      const g = GROOVES[gName];
      const s16 = step % 16;
      const sec16 = 60 / live.current.bpm / 4;
      if (s16 === 0) {
        // Mesure suivante (avec boucle de section éventuelle).
        barIdx++;
        if (lp !== null) {
          const idxs = bs.map((b, i) => (b.sectionIdx === lp ? i : -1)).filter((i) => i >= 0);
          if (!idxs.includes(barIdx)) barIdx = idxs[0];
        } else if (barIdx >= bs.length) barIdx = 0;
        setPos({ bar: barIdx });
        if (bs[barIdx]?.sectionIdx !== bs[barIdx - 1]?.sectionIdx && g.K.length) drums.crash(t, 0.7);
      }
      const bar = bs[barIdx];
      if (!bar) return;
      // Accord courant : les accords d'une mesure se partagent les 16 pas.
      const n = Math.max(1, bar.chords.length);
      const slot = Math.floor(s16 / (16 / n));
      const cc = bar.chords[slot];
      const isChordStart = s16 % (16 / n) === 0;
      const chordDur = (16 / n) * sec16;

      if (g.K.includes(s16)) drums.kick(t);
      if (g.S.includes(s16)) drums.snare(t, 0.8);
      if (g.H.includes(s16)) drums.hat(t, s16 % 4 === 0 ? 0.9 : 0.6);
      if (s16 % 4 === 0) clickAt(t, s16 === 0);
      if (!cc) return;

      if (isChordStart) {
        const target = lastVoicing.length ? voiceLead(lastVoicing, cc.chord, 55, 79) : closeVoicing(cc.chord.notes, toMidi(cc.chord.notes[0], 4));
        lastVoicing = target;
        INSTRUMENTS.pad(target, t, chordDur, 0.7);
        INSTRUMENTS.cordes(target.map((m) => m + 12).filter((m) => m <= 88), t, chordDur, 0.6);
        INSTRUMENTS.piano(target, t, Math.min(chordDur, 2), 0.7);
      }
      if (g.basse.includes(s16 % 16) || isChordStart) {
        const bassNote = cc.bass ?? cc.chord.root;
        let m = toMidi(bassNote, 2);
        if (m < 36) m += 12;
        INSTRUMENTS.basse([m], t, sec16 * 3.5, s16 === 0 ? 1 : 0.8);
      }
    });
    return () => { stop(); setPos({ bar: -1 }); };
  }, [playing]);

  const toggleMute = (i: Inst) => setMutes((m) => ({ ...m, [i]: !m[i] }));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Groupe virtuel</h1>
        <p className="text-sm opacity-80">Batterie, basse, pad, cordes et piano suivent ta grille. Coupe un instrument pour entendre la place qu’il laisse ; boucle une section pour la travailler.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-sm">Grille
          <select value={chart.id} onChange={(e) => setChartId(e.target.value)} className="block w-full rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit">
            {charts.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label className="text-sm">Tonalité
          <select value={key} onChange={(e) => setKey(e.target.value)} className="block w-full rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit">
            {['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'Am', 'Bm', 'Cm', 'Dm', 'Em', 'F#m', 'Gm'].map((k) => <option key={k}>{k}</option>)}
          </select>
        </label>
        <label className="text-sm">Groove
          <select value={groove} onChange={(e) => setGroove(e.target.value)} className="block w-full rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20 dark:bg-nuit">
            {Object.entries(GROOVES).map(([k, g]) => <option key={k} value={k}>{g.nom}</option>)}
          </select>
        </label>
        <label className="text-sm">Tempo : {bpm} BPM
          <input type="range" min={50} max={150} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="block w-full" />
        </label>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Instruments">
        {INST_LIST.map(([i, label]) => (
          <button key={i} type="button" aria-pressed={!mutes[i]} onClick={() => toggleMute(i)}
            className={`rounded-xl border px-3 py-2 text-sm ${mutes[i] ? 'border-black/10 line-through opacity-50 dark:border-white/10' : 'border-or bg-or/15'}`}>{label}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setPlaying((p) => !p)} className="rounded-xl bg-or px-6 py-3 text-lg font-semibold text-nuit">{playing ? '■ Arrêter' : '▶ Lancer'}</button>
        <Link to="/nashville" className="text-sm text-or underline">Modifier ou créer une grille</Link>
      </div>
      <div className="space-y-3">
        {chart.sections.map((s, si) => {
          const start = bars.findIndex((b) => b.sectionIdx === si);
          return (
            <div key={si}>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-or">{s.name}</h3>
                <button type="button" onClick={() => setLoop((l) => (l === si ? null : si))} className={`rounded-full border px-2 py-0.5 text-xs ${loop === si ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>
                  {loop === si ? '🔁 En boucle' : 'Boucler'}
                </button>
              </div>
              <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {s.bars.map((_, bi) => {
                  const i = start + bi;
                  return (
                    <li key={bi} className={`rounded-md border px-2 py-3 text-center font-mono ${pos.bar === i ? 'border-or bg-or/25' : 'border-black/10 dark:border-white/10'}`}>
                      {bars[i]?.chords.map((c) => c.symbol).join(' ') || '—'}
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
      <p className="text-xs opacity-60">Les voicings du pad et du piano sont enchaînés au plus proche (voice leading automatique). La basse joue la note après la barre oblique des accords slash.</p>
    </section>
  );
}
