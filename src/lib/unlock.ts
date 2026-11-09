// Déblocage du parcours guidé : un module s'ouvre quand le précédent est validé à 70 %.
export interface ModuleStat { module: string; total: number; valides: number; }

export const UNLOCK_RATIO = 0.7;
export const moduleNum = (m: string) => Number(/^M(\d+)$/.exec(m)?.[1] ?? 0);

/** Statistiques par module (M1..M18), dans l'ordre. */
export function moduleStats(items: { id: string; module: string }[], valides: Set<string>): ModuleStat[] {
  const map = new Map<string, ModuleStat>();
  for (const f of items) {
    if (!moduleNum(f.module)) continue;
    const s = map.get(f.module) ?? { module: f.module, total: 0, valides: 0 };
    s.total++;
    if (valides.has(f.id)) s.valides++;
    map.set(f.module, s);
  }
  return [...map.values()].sort((a, b) => moduleNum(a.module) - moduleNum(b.module));
}

/** Modules ouverts : le premier toujours, puis chaque module dont le précédent atteint le seuil. */
export function unlockedModules(stats: ModuleStat[]): Set<string> {
  const open = new Set<string>();
  stats.forEach((s, i) => {
    if (i === 0) { open.add(s.module); return; }
    const p = stats[i - 1];
    if (open.has(p.module) && p.valides / p.total >= UNLOCK_RATIO) open.add(s.module);
  });
  return open;
}
