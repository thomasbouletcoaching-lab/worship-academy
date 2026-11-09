import { describe, it, expect } from 'vitest';
import { barToChords, transposeChart, renderChart, Chart } from './nashville';

const chart: Chart = {
  title: 'Grille test',
  key: 'G',
  bpm: 72,
  sections: [{ name: 'Couplet', bars: ['1 6m', '4 5', '1 5', '4 5'] }],
};

describe('Nashville', () => {
  it('traduit une grille en majeur (G)', () => {
    const r = renderChart(chart);
    expect(r[0].bars[0]).toEqual(['G', 'Em']);
    expect(r[0].bars[1]).toEqual(['C', 'D']);
  });
  it('transpose sans changer les chiffres', () => {
    const t = transposeChart(chart, 'Eb');
    expect(renderChart(t)[0].bars[0]).toEqual(['Eb', 'Cm']);
    expect(renderChart(t)[0].bars[1]).toEqual(['Ab', 'Bb']);
  });
  it('gère une tonalité mineure (Am : i = Am, VI = F, VII = G)', () => {
    expect(barToChords('Am', '1 6 7').map((c) => c.symbol)).toEqual(['Am', 'F', 'G']);
  });
  it('dominante 7 sur le V', () => {
    expect(barToChords('C', '57 7').map((c) => c.symbol)).toEqual(['G7', 'Bdim']);
  });
});

import { tokenToChartChord, parseBars, chartErrors, renderChartSymbols } from './nashville';
describe('Nashville étendu', () => {
  it('accord slash : 1/3 en G = G/B ; 4/1 en D = G/D', () => {
    expect(tokenToChartChord('G', '1/3').symbol).toBe('G/B');
    expect(tokenToChartChord('D', '4/1').symbol).toBe('G/D');
  });
  it('suffixes : sus, add9, maj7, 2m7, b7', () => {
    expect(tokenToChartChord('C', '5sus').symbol).toBe('Gsus4');
    expect(tokenToChartChord('C', '1add9').symbol).toBe('Cadd9');
    expect(tokenToChartChord('E', '4maj7').symbol).toBe('Amaj7');
    expect(tokenToChartChord('Bb', '2m7').symbol).toBe('Cm7');
    expect(tokenToChartChord('C', 'b7').symbol).toBe('Bb');
  });
  it('parse les mesures avec | et %', () => {
    expect(parseBars('1 | 5 | % | 6m 4')).toEqual(['1', '5', '5', '6m 4']);
  });
  it('signale les erreurs en français', () => {
    const errs = chartErrors({ title: 't', key: 'C', bpm: 70, sections: [{ name: 'Refrain', bars: ['1', '9', '4zz'] }] });
    expect(errs.length).toBe(2);
    expect(errs[0]).toContain('Refrain, mesure 2');
  });
  it('rendu avec slash', () => {
    expect(renderChartSymbols({ title: 't', key: 'A', bpm: 70, sections: [{ name: 'C', bars: ['1 1/3', '4'] }] })[0].bars).toEqual([['A', 'A/C#'], ['D']]);
  });
});
