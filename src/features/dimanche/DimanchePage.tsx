import { useState } from 'react';
import { readJSON, writeJSON } from '../../lib/storage';

// « Prêt pour dimanche » : tu entres ton set (chants, tonalité, tempo), l'app propose un plan sur 7 jours.
interface Song { titre: string; tonalite: string; bpm: number; }
const KEY = 'wa-set';
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function plan(songs: Song[]): { jour: string; focus: string }[] {
  const tonalites = [...new Set(songs.map((s) => s.tonalite).filter(Boolean))];
  const bpms = songs.map((s) => s.bpm).filter(Boolean);
  const bpmMax = bpms.length ? Math.max(...bpms) : 72;
  return [
    { jour: JOURS[0], focus: `Lecture : parcours chaque chant une fois, sans jouer, en repérant la tonalité (${tonalites.join(', ') || 'à définir'}).` },
    { jour: JOURS[1], focus: 'Accords : joue chaque accord de la grille en position fondamentale, puis en drop 2, mains séparées.' },
    { jour: JOURS[2], focus: `Tempo : travaille le passage le plus rapide à ${bpmMax} BPM, puis 10 % en dessous.` },
    { jour: JOURS[3], focus: 'Transitions : enchaîne les chants deux par deux, la fin de l\'un sert d\'entrée à l\'autre.' },
    { jour: JOURS[4], focus: 'Avec les chanteurs : répétition complète du set, en donnant les départs et les fins.' },
    { jour: JOURS[5], focus: 'Test final : joue le set en entier, sans arrêt, en enregistrant. Note les endroits qui bloquent.' },
    { jour: JOURS[6], focus: 'Dimanche : échauffement de 10 minutes sur la tonalité du premier chant, puis respire et concentre-toi sur le service.' },
  ];
}

export default function DimanchePage() {
  const [songs, setSongs] = useState<Song[]>(() => readJSON<Song[]>(KEY, [{ titre: '', tonalite: 'G', bpm: 72 }]));
  const update = (next: Song[]) => { setSongs(next); writeJSON(KEY, next); };
  const set = (i: number, patch: Partial<Song>) => update(songs.map((s, j) => (i === j ? { ...s, ...patch } : s)));

  return (
    <section className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Prêt pour dimanche</h1>
      <p className="max-w-2xl text-sm opacity-80">Entre ton set : titre, tonalité, tempo. L'app te propose un plan de la semaine. Les données restent sur ton appareil.</p>
      <div className="space-y-2">
        {songs.map((s, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <input aria-label="Titre" placeholder="Titre du chant (ton propre titre)" value={s.titre} onChange={(e) => set(i, { titre: e.target.value })} className="rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20" />
            <input aria-label="Tonalité" placeholder="Tonalité" value={s.tonalite} onChange={(e) => set(i, { tonalite: e.target.value })} className="rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20" />
            <input aria-label="Tempo" type="number" value={s.bpm} onChange={(e) => set(i, { bpm: Number(e.target.value) })} className="rounded-lg border border-black/15 bg-transparent p-2 dark:border-white/20" />
            <button type="button" className="rounded-lg border border-black/15 px-3 dark:border-white/20" onClick={() => update(songs.filter((_, j) => j !== i))}>Retirer</button>
          </div>
        ))}
        <button type="button" className="text-sm text-or underline" onClick={() => update([...songs, { titre: '', tonalite: 'C', bpm: 72 }])}>+ Ajouter un chant</button>
      </div>
      <ol className="space-y-2">
        {plan(songs).map((p) => (
          <li key={p.jour} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
            <p className="font-semibold">{p.jour}</p>
            <p className="text-sm">{p.focus}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
