import { describe, it, expect } from 'vitest';
import { parsePitch, extractPitches, midiName } from './pitch';
import { voiceLead, movement, commonTones } from './voiceLeading';
import { buildChord, closeVoicing } from './chords';
import { parseNote } from './notes';

describe('hauteurs avec octave', () => {
  it('parse', () => {
    expect(parsePitch('C4')).toBe(60);
    expect(parsePitch('Bb3')).toBe(58);
    expect(parsePitch('F#5')).toBe(78);
    expect(parsePitch('H4')).toBeNull();
  });
  it('extrait les notes d’un texte français', () => {
    expect(extractPitches('Cmaj7 : G3 C4 E4 B4 (drop 2)')).toEqual([55, 60, 64, 71]);
    expect(extractPitches('accord C4 – Eb4 – G4, doigts 1-3-5')).toEqual([60, 63, 67]);
    expect(extractPitches('Am7 et M7, rien ici')).toEqual([]);
    expect(extractPitches('Cmaj9 et C7b9 ne sont pas des notes')).toEqual([]);
  });
  it('nomme un MIDI', () => {
    expect(midiName(61)).toBe('C#4');
    expect(midiName(61, true)).toBe('Db4');
  });
});

describe('voice leading', () => {
  it('C → F en position proche garde C commun', () => {
    const c = closeVoicing(buildChord(parseNote('C'), 'maj').notes, 60); // C4 E4 G4
    const f = voiceLead(c, buildChord(parseNote('F'), 'maj'));
    expect(f).toEqual([60, 65, 69]); // C4 F4 A4 (2e renversement)
    expect(commonTones(c, f)).toEqual([60]);
  });
  it('G7 → Cmaj7 bouge peu (≤ 4 demi-tons au total)', () => {
    const g7 = [59, 62, 65, 67]; // B3 D4 F4 G4
    const c = voiceLead(g7, buildChord(parseNote('C'), 'maj7'));
    expect(movement(g7, c)).toBeLessThanOrEqual(4);
  });
});
