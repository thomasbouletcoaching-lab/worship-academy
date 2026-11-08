import { describe, it, expect, beforeEach } from 'vitest';
import { newCard, review, addDays, isDue, isFragile, streak, setValide, getValides, getCards, recordEar, getEar, exportProgress, decodeProgress } from './progress';
import { setRepository, memoryRepository } from './repository';

beforeEach(() => setRepository(memoryRepository()));

describe('répétition espacée', () => {
  it('les intervalles grandissent quand on réussit', () => {
    let c = newCard('x', '2026-01-01');
    c = review(c, 'moyen', '2026-01-02');
    expect(c.interval).toBe(3);
    c = review(c, 'moyen', c.due);
    expect(c.interval).toBe(7);
    c = review(c, 'moyen', c.due);
    expect(c.interval).toBe(18); // 7 × 2.5 arrondi
  });
  it('« difficile » remet la notion à demain et la marque fragile après deux échecs', () => {
    let c = newCard('x', '2026-01-01');
    c = review(c, 'difficile', '2026-01-02');
    expect(c.due).toBe('2026-01-03');
    c = review(c, 'difficile', '2026-01-03');
    expect(isFragile(c)).toBe(true);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });
  it('échéance', () => {
    expect(isDue(newCard('x', '2026-01-01'), '2026-01-02')).toBe(true);
    expect(isDue(newCard('x', '2026-01-01'), '2026-01-01')).toBe(false);
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });
});

describe('progression', () => {
  it('valider une fiche crée une carte de révision', () => {
    setValide('b-triades', true);
    expect(getValides()).toEqual(['b-triades']);
    expect(getCards()['b-triades']).toBeDefined();
    setValide('b-triades', false);
    expect(getCards()['b-triades']).toBeUndefined();
  });
  it('série de jours', () => {
    const log = ['2026-01-01', '2026-01-02', '2026-01-03'].map((date) => ({ date, kind: 'x', minutes: 5 }));
    expect(streak(log, '2026-01-03')).toBe(3);
    expect(streak(log, '2026-01-04')).toBe(3);
    expect(streak(log, '2026-01-05')).toBe(0);
  });
  it('statistiques d’oreille par catégorie et par élément', () => {
    recordEar('intervalles', 'Quinte juste', true);
    recordEar('intervalles', 'Triton', false);
    expect(getEar()['intervalles']).toEqual({ ok: 1, total: 2 });
    expect(getEar()['intervalles:Triton']).toEqual({ ok: 0, total: 1 });
  });
  it('export / import de progression (accents compris)', () => {
    setValide('b-gamme-majeure', true);
    const code = exportProgress('Élodie');
    const p = decodeProgress(code)!;
    expect(p.name).toBe('Élodie');
    expect(p.valides).toContain('b-gamme-majeure');
    expect(decodeProgress('nimportequoi')).toBeNull();
  });
});
