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
