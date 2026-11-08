import { useMemo, useState } from 'react';
import { renderChart, transposeChart, Chart } from './nashville';

// Grille d'exemple originale : structure et chiffres uniquement.
const EXAMPLE: Chart = {
  title: 'Exemple de structure',
  key: 'D',
  bpm: 72,
  sections: [
    { name: 'Intro', bars: ['1 4', '5 1'] },
    { name: 'Couplet', bars: ['1', '6m', '4', '5'] },
    { name: 'Refrain', bars: ['4', '5', '6m', '1 5'] },
    { name: 'Pont', bars: ['6m', '4', '1', '5'] },
    { name: 'Tag', bars: ['4', '1'] },
  ],
};

const KEYS = ['C', 'D', 'Eb', 'E', 'F', 'G', 'A', 'Bb'];

export default function NashvillePage() {
  const [key, setKey] = useState(EXAMPLE.key);
  const chart = useMemo(() => transposeChart(EXAMPLE, key), [key]);
  const rendered = useMemo(() => renderChart(chart), [chart]);
  return (
    <section className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Grilles en Nashville</h1>
      <p className="max-w-2xl text-sm opacity-80">
        Les chiffres ne changent jamais : seule la tonalité bouge. Une grille écrite une fois se joue dans n'importe quelle tonalité.
      </p>
      <div className="flex flex-wrap gap-2">
        {KEYS.map((k) => (
          <button key={k} type="button" onClick={() => setKey(k)}
            className={`rounded-lg border px-3 py-1 text-sm ${k === key ? 'border-or bg-or/20' : 'border-black/10 dark:border-white/10'}`}>{k}</button>
        ))}
      </div>
      <h2 className="font-semibold">{chart.title} · {chart.key} · {chart.bpm} BPM</h2>
      {chart.sections.map((s, i) => (
        <div key={s.name}>
          <h3 className="mb-2 text-sm font-semibold text-or">{s.name}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {rendered[i].bars.map((b, j) => (
              <div key={j} className="rounded-md border border-black/10 p-3 text-center font-mono dark:border-white/10">{b.join(' ')}</div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs opacity-60">Grille originale. Chiffres : 1 à 7 ; « m » = mineur ; « 57 » = dominante 7.</p>
    </section>
  );
}
