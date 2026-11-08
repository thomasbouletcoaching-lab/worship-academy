import { describe, it, expect } from 'vitest';
import { parseNote, toMidi, pc, spellPc, transposeNote, noteName } from './notes';
import { buildChord, closeVoicing, dropVoicing, drop24Voicing, invertNotes, isWellFormed, QUALITIES } from './chords';

const n = parseNote;

describe('notes', () => {
  it('C4 = 60 et Do central', () => {
    expect(toMidi(n('C'), 4)).toBe(60);
    expect(toMidi(n('A'), 4)).toBe(69);
    expect(toMidi(n('B'), 3)).toBe(59);
  });
  it('classes de hauteur', () => {
    expect(pc(n('Eb'))).toBe(3);
    expect(pc(n('Cb'))).toBe(11);
    expect(pc(n('B#'))).toBe(0);
  });
  it('transposition garde une orthographe lettre', () => {
    expect(noteName(transposeNote(n('C'), 3))).toBe('Eb');
    expect(noteName(transposeNote(n('F'), 7))).toBe('C');
    expect(noteName(transposeNote(n('Bb'), 2))).toBe('C');
  });
  it('spellPc choisit dièse ou bémol', () => {
    expect(noteName(spellPc(10))).toBe('A#');
    expect(noteName(spellPc(10, true))).toBe('Bb');
  });
});

describe('accords orthographiés', () => {
  it('toutes les qualités sont bien formées dans les 12 tonalités', () => {
    const roots = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    for (const r of roots) {
      for (const q of Object.keys(QUALITIES)) {
        const c = buildChord(n(r), q);
        expect(isWellFormed(c), `${r}${q}`).toBe(true);
      }
    }
  });
  it('Ebmaj7 = Eb G Bb D', () => {
    expect(buildChord(n('Eb'), 'maj7').notes.map(noteName)).toEqual(['Eb', 'G', 'Bb', 'D']);
  });
  it('Bdim7 = B D F Ab', () => {
    expect(buildChord(n('B'), 'dim7').notes.map(noteName)).toEqual(['B', 'D', 'F', 'Ab']);
  });
  it('F#m7b5 = F# A C E', () => {
    expect(buildChord(n('F#'), 'm7b5').notes.map(noteName)).toEqual(['F#', 'A', 'C', 'E']);
  });
  it('Db7 a une septième bémol (Cb = B)', () => {
    expect(buildChord(n('Db'), '7').notes.map(noteName)).toEqual(['Db', 'F', 'Ab', 'Cb']);
  });
  it('Cmaj9 = C E G B D', () => {
    expect(buildChord(n('C'), 'maj9').notes.map(noteName)).toEqual(['C', 'E', 'G', 'B', 'D']);
  });
  it('renversement', () => {
    const c = buildChord(n('C'), 'maj');
    expect(invertNotes(c, 1).map(noteName)).toEqual(['E', 'G', 'C']);
  });
});

describe('voicings', () => {
  it('position serrée Cmaj7 = C4 E4 G4 B4', () => {
    const c = buildChord(n('C'), 'maj7');
    expect(closeVoicing(c.notes, 60)).toEqual([60, 64, 67, 71]);
  });
  it('drop 2 Cmaj7 = G3 C4 E4 B4 (55 60 64 71)', () => {
    const close = closeVoicing(buildChord(n('C'), 'maj7').notes, 60);
    expect(dropVoicing(close, 2)).toEqual([55, 60, 64, 71]);
  });
  it('drop 3 Cmaj7 = E3 C4 G4 B4 (52 60 67 71)', () => {
    const close = closeVoicing(buildChord(n('C'), 'maj7').notes, 60);
    expect(dropVoicing(close, 3)).toEqual([52, 60, 67, 71]);
  });
  it('drop 2-4 Cmaj7 : 2e et 4e depuis le haut descendues', () => {
    const close = closeVoicing(buildChord(n('C'), 'maj7').notes, 60); // 60 64 67 71
    // 2e depuis le haut = 67 -> 55 ; 4e depuis le haut = 60 -> 48
    expect(drop24Voicing(close)).toEqual([48, 55, 64, 71]);
  });
  it('les 4 renversements de Cmaj7 donnent 4 drop 2 différents (4 notes du haut distinctes)', () => {
    const c = buildChord(n('C'), 'maj7');
    const tops = new Set<number>();
    for (let inv = 0; inv < 4; inv++) {
      const notes = invertNotes(c, inv);
      const close = closeVoicing(notes, 60);
      const d = dropVoicing(close, 2);
      tops.add(Math.max(...d) % 12);
    }
    expect(tops.size).toBe(4);
  });
});
