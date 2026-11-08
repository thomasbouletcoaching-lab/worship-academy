// Façade simple au-dessus du moteur audio (compatibilité avec les pages existantes).
import { getCtx, INSTRUMENTS, clickAt, drums, midiToHz, Release } from './engine';

export { midiToHz };

export type SoundName = 'piano' | 'rhodes' | 'orgue' | 'pad' | 'cordes' | 'basse';

/** Joue des notes MIDI maintenant (ou après `when` secondes). Renvoie une fonction de relâche. */
export function playNotes(midis: number[], seconds = 1.6, when = 0, sound: SoundName = 'piano', vel = 0.8): Release {
  const c = getCtx();
  if (!c) return () => {};
  return INSTRUMENTS[sound](midis, c.currentTime + when + 0.01, seconds, vel);
}

/** Joue des notes l'une après l'autre (arpège / mélodie). */
export function playSequence(midis: number[], gap = 0.5, dur = 0.8, sound: SoundName = 'piano'): void {
  midis.forEach((m, i) => playNotes([m], dur, i * gap, sound));
}

/** Nappe tenue (jusqu'à 10 min) : renvoie la fonction qui la coupe en fondu. */
export function startPad(midis: number[], sound: 'pad' | 'cordes' | 'orgue' = 'pad'): () => void {
  const release = playNotes(midis, 600, 0, sound, 0.8);
  return () => release(1.5);
}

export function click(accent = false): void {
  const c = getCtx();
  if (c) clickAt(c.currentTime + 0.005, accent);
}

export function kick(): void {
  const c = getCtx();
  if (c) drums.kick(c.currentTime + 0.005);
}
