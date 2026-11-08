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
