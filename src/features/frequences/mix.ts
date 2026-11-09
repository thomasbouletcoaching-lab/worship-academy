// Analyse pédagogique d'un arrangement : où se placent les notes et quels conflits apparaissent.
import { midiToHz, midiName } from '../../theory/pitch';

export interface Part { nom: string; notes: number[]; }
export interface Finding { niveau: 'ok' | 'attention' | 'probleme'; message: string; }

/** Limite des intervalles graves (règle classique : sous ≈ E3/F3, éviter tierces et secondes). */
const LOW_INTERVAL_LIMIT = 52; // E3

export function analyzeMix(basse: number[], mg: number[], md: number[], voix: number[]): Finding[] {
  const out: Finding[] = [];
  const piano = [...mg, ...md].sort((a, b) => a - b);

  // 1. La main gauche double la basse (même note ou même classe dans le grave).
  const doubles = mg.filter((m) => basse.some((b) => m % 12 === b % 12 && midiToHz(m) < 250));
  if (basse.length && doubles.length) {
    out.push({ niveau: 'probleme', message: `La main gauche double la basse (${doubles.map((m) => midiName(m, true)).join(', ')} sous 250 Hz). En groupe, laisse la fondamentale au bassiste.` });
  }

  // 2. Intervalles serrés dans le grave (secondes et tierces sous E3).
  const low = piano.filter((m) => m < LOW_INTERVAL_LIMIT + 4);
  for (let i = 1; i < low.length; i++) {
    const d = low[i] - low[i - 1];
    if (d > 0 && d <= 4 && low[i - 1] < LOW_INTERVAL_LIMIT) {
      out.push({ niveau: 'probleme', message: `${midiName(low[i - 1], true)}–${midiName(low[i], true)} : intervalle de ${d} demi-ton(s) dans le grave. Sous E3, préfère quintes et octaves.` });
      break;
    }
  }

  // 3. Zone de boue : au moins 3 notes de piano entre C3 et C4 (≈ 130–260 Hz) dont deux serrées (≤ tierce majeure).
  const mud = piano.filter((m) => m >= 48 && m < 60);
  const tight = mud.some((m, i) => i > 0 && m - mud[i - 1] <= 4);
  if (mud.length >= 3 && tight) out.push({ niveau: 'attention', message: `${mud.length} notes serrées entre C3 et C4 (≈ 130–260 Hz) : le bas-médium devient « boueux ». Ouvre l’accord (drop 2) ou monte la main droite.` });

  // 4. Le piano au-dessus du chanteur.
  if (voix.length && md.length) {
    const topPiano = Math.max(...md);
    const lowVoice = Math.min(...voix);
    if (topPiano > Math.max(...voix)) out.push({ niveau: 'probleme', message: `La note la plus haute du piano (${midiName(topPiano, true)}) passe au-dessus de la mélodie. Le chanteur doit rester la voix la plus aiguë.` });
    else if (topPiano >= lowVoice) out.push({ niveau: 'attention', message: 'La main droite joue dans le même registre que la mélodie : écarte-toi d’une tierce ou d’une octave pour laisser la voix respirer.' });
  }

  // 5. Densité : trop de notes au piano en groupe.
  if (piano.length > 7) out.push({ niveau: 'attention', message: `${piano.length} notes au piano : en groupe, « less is more ». 3 à 5 notes suffisent souvent.` });

  if (!out.length) out.push({ niveau: 'ok', message: 'Bonne répartition : la basse a le grave, le piano le médium, la voix reste au-dessus.' });
  return out;
}

/** Zones pédagogiques (Hz). */
export const BANDS = [
  { label: 'Grave : basse et grosse caisse', from: 40, to: 250, color: '#5f9e6e' },
  { label: 'Bas-médium : zone de boue', from: 250, to: 500, color: '#b5485a' },
  { label: 'Médium : piano, guitares, pads', from: 500, to: 2000, color: '#c9a24a' },
  { label: 'Présence vocale', from: 2000, to: 5000, color: '#3b6ea5' },
  { label: 'Brillance', from: 5000, to: 16000, color: '#8e7cc3' },
];
