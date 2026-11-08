import { describe, it, expect } from 'vitest';
import { checkChord, timing, velocityRegularity, sequenceAccuracy, verdict } from './evaluate';
import { detectPitch, centsOff } from '../../audio/pitchDetect';

describe('accord joué', () => {
  it('accepte n’importe quel renversement et doublure', () => {
    expect(checkChord([0, 4, 7], [64, 67, 72, 48]).ok).toBe(true);
  });
  it('signale les notes manquantes et en trop', () => {
    const r = checkChord([0, 4, 7], [60, 63, 67]);
    expect(r.ok).toBe(false);
    expect(r.manquantes).toEqual([4]);
    expect(r.enTrop).toEqual([3]);
  });
  it('vérifie la basse imposée', () => {
    expect(checkChord([0, 4, 7], [64, 67, 72], 4).ok).toBe(true);
    expect(checkChord([0, 4, 7], [60, 64, 67], 4).basseOk).toBe(false);
  });
});

describe('rythme', () => {
  it('mesure les écarts au temps le plus proche', () => {
    const t = timing([1010, 1490, 2030], 1000, 500); // +10, −10, +30
    expect(t.ecarts).toEqual([10, -10, 30]);
    expect(t.moyenneMs).toBe(17);
    expect(t.tendanceMs).toBe(10);
    expect(t.maxMs).toBe(30);
  });
  it('régularité de vélocité', () => {
    expect(velocityRegularity([80, 80, 80])).toBe(100);
    expect(velocityRegularity([40, 120, 40, 120])).toBeLessThan(50);
  });
  it('justesse de séquence', () => {
    expect(sequenceAccuracy([60, 62, 64], [72, 74, 76])).toBe(100);
    expect(sequenceAccuracy([60, 62, 64], [60, 61, 64])).toBe(67);
  });
  it('verdict selon le palier', () => {
    expect(verdict(100, 30, 2).reussi).toBe(true);
    expect(verdict(100, 50, 2).reussi).toBe(false);
    expect(verdict(80, 10, 1).reussi).toBe(false);
  });
});

describe('détection de hauteur', () => {
  const sine = (hz: number, sr = 44100, n = 4096) => {
    const b = new Float32Array(n);
    for (let i = 0; i < n; i++) b[i] = 0.5 * Math.sin((2 * Math.PI * hz * i) / sr) + 0.15 * Math.sin((4 * Math.PI * hz * i) / sr);
    return b;
  };
  it('trouve le La 440 et le Do central à quelques cents près', () => {
    expect(Math.abs(centsOff(detectPitch(sine(440), 44100)!, 69))).toBeLessThan(10);
    expect(Math.abs(centsOff(detectPitch(sine(261.63), 44100)!, 60))).toBeLessThan(10);
    expect(Math.abs(centsOff(detectPitch(sine(110), 44100)!, 45))).toBeLessThan(10);
  });
  it('silence → null', () => {
    expect(detectPitch(new Float32Array(2048), 44100)).toBeNull();
  });
});
