// Moteur audio Web Audio : instruments synthétisés, bus de mixage par instrument, analyseur,
// ordonnanceur précis (lookahead). Tout échoue en silence si le navigateur n'a pas d'audio.

export const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let analyser: AnalyserNode | null = null;

export function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8;
      const comp = ctx.createDynamicsCompressor();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      master.connect(comp).connect(analyser).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export const getAnalyser = () => (getCtx(), analyser);

// ---------- Bus par instrument (volume + mute) ----------
export type InstrumentId = 'piano' | 'rhodes' | 'orgue' | 'pad' | 'cordes' | 'basse' | 'batterie' | 'clic';

const buses = new Map<InstrumentId, GainNode>();
export function bus(id: InstrumentId): GainNode | null {
  const c = getCtx();
  if (!c || !master) return null;
  let b = buses.get(id);
  if (!b) {
    b = c.createGain();
    b.connect(master);
    buses.set(id, b);
  }
  return b;
}
export function setBusLevel(id: InstrumentId, level: number) {
  const b = bus(id);
  const c = getCtx();
  if (b && c) b.gain.setTargetAtTime(level, c.currentTime, 0.02);
}

// ---------- Instruments ----------
/** Relâche les voix jouées (fondu court puis arrêt). */
export type Release = (fade?: number) => void;
type Play = (midis: number[], time: number, dur: number, vel?: number) => Release;

/** Collecte les nœuds d'une note pour pouvoir la relâcher avant sa fin prévue. */
function voiceSet() {
  const gains: GainNode[] = [];
  const srcs: AudioScheduledSourceNode[] = [];
  const release: Release = (fade = 0.3) => {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    for (const g of gains) {
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0.0001, t + fade);
      } catch { /* nœud déjà libéré */ }
    }
    for (const s of srcs) {
      try { s.stop(t + fade + 0.05); } catch { /* déjà arrêté */ }
    }
  };
  return { gains, srcs, release };
}
const NOOP: Release = () => {};

function env(g: GainNode, t: number, peak: number, attack: number, decayTo: number, decay: number, end: number, release = 0.08) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.setTargetAtTime(Math.max(decayTo, 0.0001), t + attack, decay);
  g.gain.setTargetAtTime(0.0001, end, release);
}

/** Piano : additif avec harmoniques qui décroissent plus vite dans l'aigu. */
const piano: Play = (midis, time, dur, vel = 0.8) => {
  const c = getCtx(); const out = bus('piano'); if (!c || !out) return NOOP;
  const v = voiceSet();
  for (const m of midis) {
    const f = midiToHz(m);
    [1, 2, 3, 4].forEach((h, i) => {
      const o = c.createOscillator(); const g = c.createGain();
      o.type = i === 0 ? 'triangle' : 'sine';
      o.frequency.value = f * h;
      const amp = (0.16 * vel) / (h * h);
      env(g, time, amp, 0.004, amp * 0.05, 0.6 / h + 0.4, time + dur);
      o.connect(g).connect(out);
      o.start(time); o.stop(time + dur + 0.6);
      v.gains.push(g); v.srcs.push(o);
    });
  }
  return v.release;
};

/** Rhodes : synthèse FM (porteuse sinus, modulatrice ratio 1, indice qui décroît : « tine »). */
const rhodes: Play = (midis, time, dur, vel = 0.8) => {
  const c = getCtx(); const out = bus('rhodes'); if (!c || !out) return NOOP;
  const v = voiceSet();
  for (const m of midis) {
    const f = midiToHz(m);
    const car = c.createOscillator(); const mod = c.createOscillator(); const idx = c.createGain(); const g = c.createGain();
    car.frequency.value = f; mod.frequency.value = f;
    idx.gain.setValueAtTime(f * 2.2 * vel, time);
    idx.gain.setTargetAtTime(f * 0.3, time, 0.15);
    mod.connect(idx).connect(car.frequency);
    env(g, time, 0.14 * vel, 0.003, 0.05 * vel, 0.9, time + dur, 0.15);
    car.connect(g).connect(out);
    car.start(time); mod.start(time); car.stop(time + dur + 0.8); mod.stop(time + dur + 0.8);
    v.gains.push(g); v.srcs.push(car, mod);
  }
  return v.release;
};

// ---------- Orgue à tirettes ----------
/** Rapports harmoniques des 9 tirettes : 16', 5 1/3', 8', 4', 2 2/3', 2', 1 3/5', 1 1/3', 1'. */
export const DRAWBAR_RATIOS = [0.5, 1.5, 1, 2, 3, 4, 5, 6, 8];
export const DRAWBAR_LABELS = ["16'", "5⅓'", "8'", "4'", "2⅔'", "2'", "1⅗'", "1⅓'", "1'"];

export interface OrganSettings {
  drawbars: number[]; // 9 valeurs 0..8
  leslie: 'off' | 'lent' | 'rapide';
  percussion: 'off' | '2nd' | '3rd';
}
export const ORGAN_PRESETS: Record<string, number[]> = {
  'Gospel plein (88 8888 888)': [8, 8, 8, 8, 8, 8, 8, 8, 8],
  'Gospel classique (88 8000 000)': [8, 8, 8, 0, 0, 0, 0, 0, 0],
  'Ballade douce (00 8000 000)': [0, 0, 8, 0, 0, 0, 0, 0, 0],
  'Jimmy (88 8000 008)': [8, 8, 8, 0, 0, 0, 0, 0, 8],
  'Église (80 8800 000)': [8, 0, 8, 8, 0, 0, 0, 0, 0],
  'Shout (88 8800 888)': [8, 8, 8, 8, 0, 0, 8, 8, 8],
};
export let organSettings: OrganSettings = { drawbars: ORGAN_PRESETS['Gospel classique (88 8000 000)'], leslie: 'lent', percussion: 'off' };
export function setOrgan(s: Partial<OrganSettings>) {
  organSettings = { ...organSettings, ...s };
  updateLeslie();
}

let leslieLfo: OscillatorNode | null = null;
let leslieDepth: GainNode | null = null;
let leslieTrem: GainNode | null = null;
let leslieTremDepth: GainNode | null = null;

function leslieNodes() {
  const c = getCtx(); const out = bus('orgue'); if (!c || !out) return null;
  if (!leslieLfo) {
    leslieLfo = c.createOscillator();
    leslieDepth = c.createGain(); // vibrato (cents via detune)
    leslieTrem = c.createGain(); // trémolo d'amplitude
    leslieTremDepth = c.createGain();
    leslieTrem.gain.value = 1;
    leslieLfo.connect(leslieDepth);
    leslieLfo.connect(leslieTremDepth).connect(leslieTrem.gain);
    leslieTrem.connect(out);
    leslieLfo.start();
    updateLeslie();
  }
  return { trem: leslieTrem!, depth: leslieDepth! };
}

/** Accélération / ralentissement progressifs du Leslie (comme un vrai moteur). */
function updateLeslie() {
  const c = getCtx();
  if (!c || !leslieLfo || !leslieDepth || !leslieTremDepth) return;
  const speed = organSettings.leslie === 'rapide' ? 6.7 : organSettings.leslie === 'lent' ? 0.8 : 0;
  const ramp = organSettings.leslie === 'rapide' ? 0.6 : 1.2;
  leslieLfo.frequency.setTargetAtTime(Math.max(speed, 0.0001), c.currentTime, ramp);
  leslieDepth.gain.setTargetAtTime(speed ? 12 : 0, c.currentTime, 0.2);
  leslieTremDepth.gain.setTargetAtTime(speed ? 0.18 : 0, c.currentTime, 0.2);
}

const orgue: Play = (midis, time, dur, vel = 0.8) => {
  const c = getCtx(); const nodes = leslieNodes(); if (!c || !nodes) return NOOP;
  const v = voiceSet();
  const total = organSettings.drawbars.reduce((a, b) => a + b, 0) || 1;
  for (const m of midis) {
    const f = midiToHz(m);
    const g = c.createGain();
    // Orgue : attaque immédiate, sustain constant, relâche courte (pas de dynamique de toucher).
    env(g, time, (0.5 * 0.7) / Math.sqrt(total) * (0.6 + 0.4 * vel), 0.008, (0.35 * 0.7) / Math.sqrt(total), 10, time + dur, 0.03);
    g.connect(nodes.trem);
    organSettings.drawbars.forEach((level, i) => {
      if (!level) return;
      const o = c.createOscillator(); const dg = c.createGain();
      o.frequency.value = f * DRAWBAR_RATIOS[i];
      nodes.depth.connect(o.detune);
      dg.gain.value = level / 8;
      o.connect(dg).connect(g);
      o.start(time); o.stop(time + dur + 0.1);
      v.srcs.push(o);
    });
    v.gains.push(g);
    if (organSettings.percussion !== 'off') {
      const o = c.createOscillator(); const pg = c.createGain();
      o.frequency.value = f * (organSettings.percussion === '2nd' ? 2 : 3);
      pg.gain.setValueAtTime(0.12, time);
      pg.gain.setTargetAtTime(0.0001, time, 0.12);
      o.connect(pg).connect(nodes.trem);
      o.start(time); o.stop(time + 0.8);
    }
  }
  return v.release;
};

/** Pad : scie désaccordée, filtre passe-bas, attaque lente. */
const pad: Play = (midis, time, dur, vel = 0.7) => {
  const c = getCtx(); const out = bus('pad'); if (!c || !out) return NOOP;
  const v = voiceSet();
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(out);
  for (const m of midis) for (const d of [-7, 7]) {
    const o = c.createOscillator(); const g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = midiToHz(m); o.detune.value = d;
    env(g, time, 0.035 * vel, Math.min(1.2, dur * 0.5), 0.03 * vel, 2, time + dur, 0.8);
    o.connect(g).connect(lp); o.start(time); o.stop(time + dur + 3);
    v.gains.push(g); v.srcs.push(o);
  }
  return v.release;
};

/** Cordes : scie + vibrato léger, attaque moyenne. */
const cordes: Play = (midis, time, dur, vel = 0.7) => {
  const c = getCtx(); const out = bus('cordes'); if (!c || !out) return NOOP;
  const v = voiceSet();
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(out);
  const vib = c.createOscillator(); const vd = c.createGain(); vib.frequency.value = 5.5; vd.gain.value = 6; vib.connect(vd);
  vib.start(time); vib.stop(time + dur + 2); v.srcs.push(vib);
  for (const m of midis) for (const d of [-4, 4]) {
    const o = c.createOscillator(); const g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = midiToHz(m); o.detune.value = d; vd.connect(o.detune);
    env(g, time, 0.03 * vel, 0.35, 0.027 * vel, 2, time + dur, 0.5);
    o.connect(g).connect(lp); o.start(time); o.stop(time + dur + 2);
    v.gains.push(g); v.srcs.push(o);
  }
  return v.release;
};

/** Basse : triangle + sous-harmonique, pincée. */
const basse: Play = (midis, time, dur, vel = 0.9) => {
  const c = getCtx(); const out = bus('basse'); if (!c || !out) return NOOP;
  const v = voiceSet();
  for (const m of midis) {
    const o = c.createOscillator(); const g = c.createGain(); const lp = c.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = midiToHz(m); lp.type = 'lowpass'; lp.frequency.value = 600;
    env(g, time, 0.45 * vel, 0.006, 0.25 * vel, 0.5, time + dur * 0.95, 0.06);
    o.connect(lp).connect(g).connect(out); o.start(time); o.stop(time + dur + 0.3);
    v.gains.push(g); v.srcs.push(o);
  }
  return v.release;
};

export const INSTRUMENTS: Record<'piano' | 'rhodes' | 'orgue' | 'pad' | 'cordes' | 'basse', Play> = { piano, rhodes, orgue, pad, cordes, basse };
export const INSTRUMENT_LABELS: Record<string, string> = {
  piano: 'Piano', rhodes: 'Rhodes', orgue: 'Orgue', pad: 'Pad', cordes: 'Cordes', basse: 'Basse', batterie: 'Batterie', clic: 'Clic',
};

// ---------- Batterie synthétisée ----------
let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource(); s.buffer = noiseBuf; return s;
}
export const drums = {
  kick(time: number, vel = 1) {
    const c = getCtx(); const out = bus('batterie'); if (!c || !out) return;
    const o = c.createOscillator(); const g = c.createGain();
    o.frequency.setValueAtTime(130, time); o.frequency.exponentialRampToValueAtTime(42, time + 0.12);
    g.gain.setValueAtTime(0.9 * vel, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);
    o.connect(g).connect(out); o.start(time); o.stop(time + 0.4);
  },
  snare(time: number, vel = 1) {
    const c = getCtx(); const out = bus('batterie'); if (!c || !out) return;
    const n = noise(c); const hp = c.createBiquadFilter(); const g = c.createGain();
    hp.type = 'highpass'; hp.frequency.value = 1500;
    g.gain.setValueAtTime(0.35 * vel, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    n.connect(hp).connect(g).connect(out); n.start(time); n.stop(time + 0.2);
    const o = c.createOscillator(); const og = c.createGain(); o.frequency.value = 190;
    og.gain.setValueAtTime(0.25 * vel, time); og.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
    o.connect(og).connect(out); o.start(time); o.stop(time + 0.12);
  },
  hat(time: number, vel = 1, open = false) {
    const c = getCtx(); const out = bus('batterie'); if (!c || !out) return;
    const n = noise(c); const hp = c.createBiquadFilter(); const g = c.createGain();
    hp.type = 'highpass'; hp.frequency.value = 7000;
    const len = open ? 0.3 : 0.05;
    g.gain.setValueAtTime(0.12 * vel, time); g.gain.exponentialRampToValueAtTime(0.0001, time + len);
    n.connect(hp).connect(g).connect(out); n.start(time); n.stop(time + len + 0.02);
  },
  /** Cymbale crash (début de section). */
  crash(time: number, vel = 1) {
    const c = getCtx(); const out = bus('batterie'); if (!c || !out) return;
    const n = noise(c); const hp = c.createBiquadFilter(); const g = c.createGain();
    hp.type = 'highpass'; hp.frequency.value = 4500;
    g.gain.setValueAtTime(0.15 * vel, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 1.6);
    n.connect(hp).connect(g).connect(out); n.start(time); n.stop(time + 1.7);
  },
};

export function clickAt(time: number, accent = false) {
  const c = getCtx(); const out = bus('clic'); if (!c || !out) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.frequency.value = accent ? 1500 : 1000;
  g.gain.setValueAtTime(accent ? 0.35 : 0.2, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
  o.connect(g).connect(out); o.start(time); o.stop(time + 0.06);
}

// ---------- Ordonnanceur (lookahead) ----------
/**
 * Appelle `onStep(stepIndex, audioTime)` pour chaque pas (double-croche par défaut : 4 pas par temps),
 * avec un temps audio exact. `getBpm` est relu à chaque pas pour suivre le curseur de tempo.
 */
export function startScheduler(getBpm: () => number, onStep: (step: number, time: number) => void, stepsPerBeat = 4): () => void {
  const c = getCtx();
  if (!c) return () => {};
  let step = 0;
  let next = c.currentTime + 0.1;
  const id = window.setInterval(() => {
    while (next < c.currentTime + 0.12) {
      onStep(step, next);
      next += 60 / getBpm() / stepsPerBeat;
      step++;
    }
  }, 25);
  return () => window.clearInterval(id);
}

/** Temps audio courant (pour aligner l'affichage). */
export const now = () => getCtx()?.currentTime ?? 0;
