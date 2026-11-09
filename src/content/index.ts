// Point d'accès unique aux fiches (chargées une seule fois).
import { loadFiches, Fiche } from './loader';

export const fiches: Fiche[] = loadFiches();
export const ficheById = new Map(fiches.map((f) => [f.id, f]));
export const GROUPES = [
  { n: 1, nom: 'Niveau 1 · Servir', court: 'Servir', modules: 'M1–M6' },
  { n: 2, nom: 'Niveau 2 · Enrichir', court: 'Enrichir', modules: 'M7–M12' },
  { n: 3, nom: 'Niveau 3 · Maîtriser', court: 'Maîtriser', modules: 'M13–M18' },
  { n: 0, nom: 'Transversal', court: 'Transversal', modules: 'Sons, matériel, spirituel' },
];

/** Exercice de l'app le plus proche d'une fiche (lien « S'entraîner »). */
export function exerciseFor(f: Fiche): { path: string; label: string } {
  const id = f.id;
  const palier = f.groupe === 3 ? 3 : f.groupe === 2 ? 2 : 1;
  if (/^(b-intervalles|b-reconnaitre-intervalles|o-)/.test(id)) return { path: `/oreille?mode=${id.startsWith('o-accords') ? 'accords' : id.startsWith('o-degres') ? 'degres' : 'intervalles'}`, label: 'Entraîner l’oreille' };
  if (/^(b-gamme-majeure|b-doigtes-gammes|a-improviser|p-pentatonique|p-blues|x-modes)/.test(id)) return { path: `/entrainement?type=gammes&palier=${palier}`, label: 'Gamme au métronome' };
  if (/^(l-|m-lire-grille|m-nashville|p-populaires|p-basiques|p-enrichies|h-mouvements|a-plaquer|s-251|s-736|r-)/.test(id)) return { path: `/entrainement?type=progression&palier=${palier}`, label: 'Grille au métronome' };
  if (/^(b-noms-des-notes|b-repere-clavier|m-jouer-chanter|h-tonalites-voix)/.test(id)) return { path: '/entrainement?type=micro', label: 'Note au micro' };
  if (/^(gr-occupation|gr-place|gr-roles)/.test(id)) return { path: '/frequences', label: 'Visualiseur de fréquences' };
  if (/^(sn-orgue|sn-pads|sn-cordes|sn-piano)/.test(id)) return { path: '/sons', label: 'Labo de sons' };
  if (/^(gr-|t-set|t-conduire)/.test(id)) return { path: '/groupe', label: 'Groupe virtuel' };
  if (/^(sp-|g-spontane|g-improvisation)/.test(id)) return { path: '/culte', label: 'Simulateur de culte' };
  if (/^(v-|c-|y-|s-)/.test(id)) return { path: `/accords`, label: 'Dictionnaire de voicings' };
  return { path: `/entrainement?type=accords&palier=${palier}`, label: 'Accords au clavier' };
}
