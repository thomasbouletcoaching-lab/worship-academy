// Progression de l'élève : fiches validées, répétition espacée, journal de pratique, statistiques.
import { repo } from './repository';

const K = { valides: 'wa-valide', srs: 'wa-srs', log: 'wa-log', ear: 'wa-ear', ex: 'wa-exercices' };

// ---------- Répétition espacée (SM-2 simplifié) ----------
export type Grade = 'difficile' | 'moyen' | 'facile';
export interface Card { id: string; interval: number; ease: number; due: string; reps: number; lapses: number; }

export const today = (d = new Date()) => d.toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export function newCard(id: string, on = today()): Card {
  return { id, interval: 1, ease: 2.5, due: addDays(on, 1), reps: 0, lapses: 0 };
}

/** Met à jour une carte après une révision. « difficile » = notion fragile : on la revoit demain. */
export function review(card: Card, grade: Grade, on = today()): Card {
  if (grade === 'difficile') {
    return { ...card, interval: 1, ease: Math.max(1.3, card.ease - 0.2), due: addDays(on, 1), reps: 0, lapses: card.lapses + 1 };
  }
  const ease = grade === 'facile' ? card.ease + 0.15 : card.ease;
  const reps = card.reps + 1;
  const base = reps === 1 ? (grade === 'facile' ? 4 : 3) : reps === 2 ? 7 : Math.round(card.interval * ease);
  const interval = Math.max(1, base);
  return { ...card, interval, ease, reps, due: addDays(on, interval) };
}

export const isDue = (c: Card, on = today()) => c.due <= on;
/** Une notion est fragile si elle a été ratée au moins deux fois, ou ratée récemment. */
export const isFragile = (c: Card) => c.lapses >= 2 || (c.lapses >= 1 && c.reps === 0);

// ---------- Fiches validées ----------
export const getValides = (): string[] => repo().get<string[]>(K.valides, []);
export function setValide(id: string, ok: boolean) {
  const v = new Set(getValides());
  if (ok) v.add(id); else v.delete(id);
  repo().set(K.valides, [...v]);
  const cards = getCards();
  if (ok && !cards[id]) { cards[id] = newCard(id); repo().set(K.srs, cards); }
  if (!ok && cards[id]) { delete cards[id]; repo().set(K.srs, cards); }
}

export const getCards = (): Record<string, Card> => repo().get<Record<string, Card>>(K.srs, {});
export function gradeCard(id: string, grade: Grade) {
  const cards = getCards();
  cards[id] = review(cards[id] ?? newCard(id), grade);
  repo().set(K.srs, cards);
  logPractice('revision', 2);
}

// ---------- Journal de pratique ----------
export interface LogEntry { date: string; kind: string; minutes: number; }
export const getLog = (): LogEntry[] => repo().get<LogEntry[]>(K.log, []);
export function logPractice(kind: string, minutes: number) {
  const log = getLog();
  log.push({ date: today(), kind, minutes });
  repo().set(K.log, log.slice(-2000));
}

/** Jours consécutifs de pratique jusqu'à aujourd'hui (ou hier). */
export function streak(log: LogEntry[], on = today()): number {
  const days = new Set(log.map((l) => l.date));
  let d = days.has(on) ? on : addDays(on, -1);
  let n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

// ---------- Oreille ----------
export type EarStats = Record<string, { ok: number; total: number }>;
export const getEar = (): EarStats => repo().get<EarStats>(K.ear, {});
export function recordEar(category: string, item: string, ok: boolean) {
  const s = getEar();
  for (const key of [category, `${category}:${item}`]) {
    const e = s[key] ?? { ok: 0, total: 0 };
    s[key] = { ok: e.ok + (ok ? 1 : 0), total: e.total + 1 };
  }
  repo().set(K.ear, s);
}

// ---------- Exercices au clavier ----------
export interface ExerciseResult { date: string; exercise: string; justesse: number; ecartMs: number | null; regularite: number | null; reussi: boolean; }
export const getExercises = (): ExerciseResult[] => repo().get<ExerciseResult[]>(K.ex, []);
export function recordExercise(r: Omit<ExerciseResult, 'date'>) {
  const all = getExercises();
  all.push({ ...r, date: today() });
  repo().set(K.ex, all.slice(-1000));
  logPractice('exercice', 3);
}

/** Export / import (partage avec le responsable louange). */
export function exportProgress(name: string): string {
  const payload = { v: 1, name, valides: getValides(), ear: getEar(), ex: getExercises().slice(-50), log: getLog().slice(-200) };
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}
export interface SharedProgress { v: number; name: string; valides: string[]; ear: EarStats; ex: ExerciseResult[]; log: LogEntry[]; }
export function decodeProgress(code: string): SharedProgress | null {
  try {
    const p = JSON.parse(decodeURIComponent(escape(atob(code.trim())))) as SharedProgress;
    return p && p.v === 1 && Array.isArray(p.valides) ? p : null;
  } catch {
    return null;
  }
}
