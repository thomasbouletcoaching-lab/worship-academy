import { useState } from 'react';
import { playNotes } from '../../audio/synth';

// Intervalles (demi-tons → nom, son caractéristique en français).
const INTERVALS: { semis: number; name: string; hint: string }[] = [
  { semis: 2, name: 'Seconde majeure', hint: 'Ré-Do : un pas de gamme' },
  { semis: 3, name: 'Tierce mineure', hint: 'Mi-Do dans un air triste' },
  { semis: 4, name: 'Tierce majeure', hint: 'Do-Mi : joyeux, ouvert' },
  { semis: 5, name: 'Quarte juste', hint: 'Do-Fa : le début de Joyeux Noël' },
  { semis: 6, name: 'Triton', hint: 'Do-Fa# : tendu, instable' },
  { semis: 7, name: 'Quinte juste', hint: 'Do-Sol : stable, des cordes' },
  { semis: 8, name: 'Sixte mineure', hint: 'Mi-Do : nostalgique' },
  { semis: 9, name: 'Sixte majeure', hint: 'Do-La : lumineux' },
  { semis: 10, name: 'Septième mineure', hint: 'Do-Sib : attente' },
  { semis: 11, name: 'Septième majeure', hint: 'Do-Si : tension douce' },
  { semis: 12, name: 'Octave', hint: 'Do-Do : même nom, autre hauteur' },
];

export default function EarTrainer() {
  const [target, setTarget] = useState(INTERVALS[0]);
  const [base, setBase] = useState(60);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });

  const next = () => {
    const t = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    const b = 55 + Math.floor(Math.random() * 10);
    setTarget(t);
    setBase(b);
    setAnswer(null);
    playNotes([b], 0.9);
    playNotes([b + t.semis], 0.9, 0.9);
  };

  const guess = (name: string) => {
    const ok = name === target.name;
    setAnswer(ok ? `Bravo : ${target.name} (${target.hint}).` : `Pas tout à fait : c'était ${target.name} (${target.hint}).`);
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <section className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Entraîneur d'oreille · intervalles</h1>
      <p className="max-w-2xl text-sm opacity-80">
        Écoute les deux notes, puis nomme l'intervalle. Commence par les intervalles qui ont un caractère net :
        la quarte, la quinte et l'octave.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="rounded-lg bg-or px-4 py-2 font-semibold text-nuit" onClick={next}>▶ Nouvel intervalle</button>
        <button type="button" className="rounded-lg border border-black/15 px-4 py-2 dark:border-white/20" onClick={() => playNotes([base, base + target.semis], 1.2)}>Réécouter</button>
        <span className="self-center text-sm">Score : {score.ok}/{score.total}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {INTERVALS.map((i) => (
          <button key={i.name} type="button" onClick={() => guess(i.name)} className="rounded-lg border border-black/10 px-3 py-2 text-left text-sm hover:border-or dark:border-white/10">
            {i.name}
          </button>
        ))}
      </div>
      {answer && <p role="status" className="rounded-lg bg-or/15 p-3 text-sm">{answer}</p>}
    </section>
  );
}
