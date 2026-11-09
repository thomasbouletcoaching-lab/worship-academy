import { describe, it, expect } from 'vitest';
import { EXAMPLES, encodeChart, decodeChart } from './charts';
import { chartErrors } from './nashville';
import { KEYS } from '../exercises/generators';

describe('grilles d’exemple', () => {
  it('sans erreur dans les 12 tonalités', () => {
    for (const ex of EXAMPLES) for (const k of KEYS) expect(chartErrors({ ...ex, key: k }), `${ex.id} en ${k}`).toEqual([]);
  });
  it('partage par code', () => {
    const c = decodeChart(encodeChart(EXAMPLES[0]))!;
    expect(c.title).toBe(EXAMPLES[0].title);
    expect(decodeChart('xx')).toBeNull();
  });
});
