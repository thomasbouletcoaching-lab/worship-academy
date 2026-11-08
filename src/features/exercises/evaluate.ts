// Évaluation des exercices joués au clavier MIDI (ou au micro) : justesse, rythme, régularité.

const pcOf = (m: number) => ((m % 12) + 12) % 12;

export interface ChordCheck { ok: boolean; manquantes: number[]; enTrop: number[]; basseOk: boolean; }

/**
 * Vérifie un accord joué : toutes les classes de hauteur demandées sont présentes, aucune en trop.
 * `bassPc` (optionnel) impose la note la plus grave (renversement ou accord slash).
 */
export function checkChord(targetPcs: number[], played: number[], bassPc?: number): ChordCheck {
  const want = new Set(targetPcs.map(pcOf));
  const got = new Set(played.map(pcOf));
  const manquantes = [...want].filter((p) => !got.has(p));
  const enTrop = [...got].filter((p) => !want.has(p));
  const lowest = played.length ? Math.min(...played) : NaN;
  const basseOk = bassPc === undefined || (played.length > 0 && pcOf(lowest) === pcOf(bassPc));
  return { ok: manquantes.length === 0 && enTrop.length === 0 && basseOk, manquantes, enTrop, basseOk };
}

export interface TimingStats { moyenneMs: number; tendanceMs: number; maxMs: number; ecarts: number[]; }

/**
 * Écarts entre les attaques jouées et la grille de temps (ms).
 * `startMs` = instant du premier temps attendu, `beatMs` = durée d'un temps.
 * Chaque attaque est comparée au temps le plus proche. tendance < 0 : en avance ; > 0 : en retard.
 */
export function timing(onsetsMs: number[], startMs: number, beatMs: number): TimingStats {
  if (!onsetsMs.length) return { moyenneMs: 0, tendanceMs: 0, maxMs: 0, ecarts: [] };
  const ecarts = onsetsMs.map((t) => {
    const k = Math.round((t - startMs) / beatMs);
    return t - (startMs + k * beatMs);
  });
  const abs = ecarts.map(Math.abs);
  return {
    moyenneMs: Math.round(abs.reduce((a, b) => a + b, 0) / abs.length),
    tendanceMs: Math.round(ecarts.reduce((a, b) => a + b, 0) / ecarts.length),
    maxMs: Math.round(Math.max(...abs)),
    ecarts: ecarts.map(Math.round),
  };
}

/** Régularité de vélocité : 100 = parfaitement égal ; baisse avec le coefficient de variation. */
export function velocityRegularity(vels: number[]): number {
  if (vels.length < 2) return 100;
  const mean = vels.reduce((a, b) => a + b, 0) / vels.length;
  if (mean === 0) return 0;
  const sd = Math.sqrt(vels.reduce((a, v) => a + (v - mean) ** 2, 0) / vels.length);
  return Math.max(0, Math.round(100 - (sd / mean) * 200));
}

/** Justesse d'une suite de notes : pourcentage de notes attendues jouées dans l'ordre (octave libre si `ignoreOctave`). */
export function sequenceAccuracy(expected: number[], played: number[], ignoreOctave = true): number {
  if (!expected.length) return 100;
  const norm = (m: number) => (ignoreOctave ? pcOf(m) : m);
  let ok = 0;
  expected.forEach((e, i) => { if (played[i] !== undefined && norm(played[i]) === norm(e)) ok++; });
  return Math.round((ok / expected.length) * 100);
}

/** Verdict lisible selon le palier (seuils en ms : 60 / 35 / 20). */
export function verdict(justesse: number, moyenneMs: number | null, palier: 1 | 2 | 3 = 1): { reussi: boolean; message: string } {
  const seuil = palier === 1 ? 60 : palier === 2 ? 35 : 20;
  if (justesse < 100) return { reussi: false, message: `Justesse ${justesse} % : reprends lentement, note par note.` };
  if (moyenneMs !== null && moyenneMs > seuil) return { reussi: false, message: `Notes justes, mais écart moyen de ${moyenneMs} ms (objectif ≤ ${seuil} ms). Garde le tempo, détends le poignet.` };
  return { reussi: true, message: moyenneMs === null ? 'Réussi : toutes les notes sont justes.' : `Réussi : notes justes, écart moyen ${moyenneMs} ms.` };
}
