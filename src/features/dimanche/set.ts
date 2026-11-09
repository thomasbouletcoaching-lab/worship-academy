// Set du dimanche : chants (titre libre, tonalité, tempo, grille liée) ; partage par code.
import { repo } from '../../lib/repository';
import { Chart } from '../nashville/nashville';

export interface SetSong { titre: string; tonalite: string; bpm: number; grille?: Chart; }
export interface WorshipSet { date: string; chants: SetSong[]; note?: string; }

const KEY = 'wa-set-v2';
export const getSet = (): WorshipSet => repo().get<WorshipSet>(KEY, { date: '', chants: [{ titre: '', tonalite: 'G', bpm: 72 }] });
export const saveSet = (s: WorshipSet) => repo().set(KEY, s);

export const encodeSet = (s: WorshipSet) => btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, s }))));
export function decodeSet(code: string): WorshipSet | null {
  try {
    const p = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    return p?.v === 1 && Array.isArray(p.s?.chants) ? (p.s as WorshipSet) : null;
  } catch {
    return null;
  }
}

/** Plan de 7 jours généré à partir du set. */
export function weekPlan(set: WorshipSet): { jour: string; focus: string; minutes: number }[] {
  const ch = set.chants.filter((c) => c.titre || c.grille);
  const tons = [...new Set(ch.map((c) => c.tonalite).filter(Boolean))];
  const bpms = ch.map((c) => c.bpm).filter(Boolean);
  const vmax = bpms.length ? Math.max(...bpms) : 72;
  const lent = Math.round(vmax * 0.8);
  const noms = ch.map((c) => c.titre || c.grille?.title || 'chant');
  const paires = noms.slice(1).map((n, i) => `${noms[i]} → ${n}`);
  return [
    { jour: 'J-6', minutes: 15, focus: `Écoute et repérage : pour chaque chant, note la tonalité (${tons.join(', ') || 'à définir'}), la structure et le tempo. Chante les mélodies.` },
    { jour: 'J-5', minutes: 20, focus: 'Accords : joue chaque grille en accords plaqués, mains séparées puis ensemble, à 60 BPM.' },
    { jour: 'J-4', minutes: 20, focus: `Voicings et voix : passe aux voicings du niveau 2 (drop 2, accords slash) et vérifie que la note du haut reste sous la mélodie. Tempo ${lent} BPM.` },
    { jour: 'J-3', minutes: 25, focus: `Tempo réel : chaque chant à son tempo (jusqu’à ${vmax} BPM) avec le groupe virtuel. Coupe la basse virtuelle : ta main gauche ne doit pas la doubler.` },
    { jour: 'J-2', minutes: 20, focus: `Transitions : ${paires.length ? paires.join(' ; ') : 'relie tes chants deux à deux'}. Prépare intros, fins et modulations.` },
    { jour: 'J-1', minutes: 30, focus: 'Test final : le set en entier, sans t’arrêter, enregistré. Coche la grille de validation ci-dessous.' },
    { jour: 'Jour J', minutes: 10, focus: 'Échauffement sur la tonalité du premier chant, pad prêt pour la prière, puis concentre-toi sur le service, pas sur toi.' },
  ];
}

/** Critères du test final, par chant. */
export const FINAL_CRITERIA = [
  'Départ donné aux chanteurs (intro claire, tempo stable)',
  'Grille jouée sans arrêt ni fausse note gênante',
  'Note du haut sous la mélodie chantée',
  'Transition vers le chant suivant préparée',
  'Fin nette (ou enchaînement vers la prière)',
];
