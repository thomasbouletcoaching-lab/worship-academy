// Voice leading : choisir la disposition de l'accord suivant qui bouge le moins.
import { Chord } from './chords';
import { pc } from './notes';

/** Toutes les dispositions serrées (renversements × octaves) d'un accord dans une plage. */
export function candidateVoicings(chord: Chord, low = 48, high = 84): number[][] {
  const pcs = chord.notes.map(pc);
  const n = pcs.length;
  const out: number[][] = [];
  for (let inv = 0; inv < n; inv++) {
    const order = [...pcs.slice(inv), ...pcs.slice(0, inv)];
    for (let base = low; base < low + 12; base++) {
      if (((base % 12) + 12) % 12 !== order[0]) continue;
      for (let oct = 0; oct < 4; oct++) {
        const v: number[] = [base + 12 * oct];
        for (let i = 1; i < n; i++) {
          let m = v[i - 1] + 1;
          while (((m % 12) + 12) % 12 !== order[i]) m++;
          v.push(m);
        }
        if (v[0] >= low && v[v.length - 1] <= high) out.push(v);
      }
    }
  }
  return out;
}

/** Coût de mouvement entre deux voicings : somme des déplacements après appariement trié. */
export function movement(a: number[], b: number[]): number {
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  const n = Math.max(sa.length, sb.length);
  let cost = 0;
  for (let i = 0; i < n; i++) {
    const x = sa[Math.min(i, sa.length - 1)];
    const y = sb[Math.min(i, sb.length - 1)];
    cost += Math.abs(x - y);
  }
  return cost;
}

/** Disposition de `next` la plus proche de `from` (mouvement minimal), dans la plage donnée. */
export function voiceLead(from: number[], next: Chord, low = 48, high = 84): number[] {
  const cands = candidateVoicings(next, low, high);
  let best = cands[0];
  let bestCost = Infinity;
  for (const c of cands) {
    const cost = movement(from, c);
    if (cost < bestCost) {
      best = c;
      bestCost = cost;
    }
  }
  return best;
}

/** Notes communes (classes de hauteur) entre deux voicings. */
export function commonTones(a: number[], b: number[]): number[] {
  const pb = new Set(b.map((m) => ((m % 12) + 12) % 12));
  return a.filter((m) => pb.has(((m % 12) + 12) % 12));
}
