// Synthé minimal Web Audio : son de piano simplifié (enveloppe percussive + harmoniques).
// Les erreurs audio (navigateur sans AudioContext, autoplay bloqué) sont silencieuses.
let ctx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

export const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export function playNotes(midis: number[], seconds = 1.6, when = 0): void {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + when;
  for (const m of midis) {
    const f = midiToHz(m);
    [1, 2, 3].forEach((mult, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.value = f * mult;
      const amp = 0.18 / (mult * mult);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(amp, t0 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
      osc.connect(gain).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + seconds + 0.05);
    });
  }
}

/** Nappe (pad) tenue : attaque lente, reste jusqu'à `stop()`. Renvoie une fonction d'arrêt. */
export function startPad(midis: number[]): () => void {
  const c = getCtx();
  if (!c) return () => {};
  const master = c.createGain();
  master.gain.setValueAtTime(0, c.currentTime);
  master.gain.linearRampToValueAtTime(0.12, c.currentTime + 1.2);
  master.connect(c.destination);
  const oscs: OscillatorNode[] = [];
  for (const m of midis) {
    for (const detune of [-6, 6]) {
      const osc = c.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = midiToHz(m);
      osc.detune.value = detune;
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      osc.connect(lp).connect(master);
      osc.start();
      oscs.push(osc);
    }
  }
  return () => {
    try {
      master.gain.cancelScheduledValues(c.currentTime);
      master.gain.linearRampToValueAtTime(0, c.currentTime + 0.8);
      oscs.forEach((o) => o.stop(c.currentTime + 0.9));
    } catch {
      /* déjà arrêté */
    }
  };
}

/** Clic de métronome. */
export function click(accent = false): void {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.frequency.value = accent ? 1400 : 1000;
  g.gain.setValueAtTime(accent ? 0.3 : 0.18, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.06);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.07);
}

/** Grosse caisse simplifiée (basse percussive). */
export function kick(): void {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.frequency.setValueAtTime(120, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.15);
  g.gain.setValueAtTime(0.5, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.25);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.3);
}
