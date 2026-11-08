// Détection de hauteur par autocorrélation (micro, mode simplifié : une note à la fois).

/** Renvoie la fréquence fondamentale en Hz, ou null si le signal est trop faible ou non périodique. */
export function detectPitch(buf: Float32Array, sampleRate: number, minHz = 60, maxHz = 1200): number | null {
  const n = buf.length;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < 0.01) return null;

  const minLag = Math.floor(sampleRate / maxHz);
  const maxLag = Math.min(Math.floor(sampleRate / minHz), n - 1);
  const corr = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) s += buf[i] * buf[i + lag];
    corr[lag] = s / (n - lag);
  }
  // Premier pic nettement positif (évite l'erreur d'octave du pic le plus haut).
  let best = -1;
  let bestVal = 0;
  const globalMax = Math.max(...Array.from(corr.slice(minLag)));
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (corr[lag] > corr[lag - 1] && corr[lag] >= corr[lag + 1] && corr[lag] > 0.85 * globalMax) {
      best = lag;
      bestVal = corr[lag];
      break;
    }
  }
  if (best < 0 || bestVal <= 0) return null;
  // Interpolation parabolique pour affiner.
  const a = corr[best - 1], b = corr[best], c = corr[best + 1];
  const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
  return sampleRate / (best + (Number.isFinite(shift) ? shift : 0));
}

/** Écart en cents entre une fréquence et une note MIDI. */
export const centsOff = (hz: number, midi: number) => 1200 * Math.log2(hz / (440 * Math.pow(2, (midi - 69) / 12)));
