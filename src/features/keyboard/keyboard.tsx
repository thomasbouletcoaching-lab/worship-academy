// Clavier animé en SVG : met en évidence les touches jouées (MIDI, C4 = 60).
import { noteName, spellPc, Note } from '../../theory/notes';

const BLACK = [1, 3, 6, 8, 10];

interface Props {
  from?: number; // MIDI de départ (défaut C3 = 48)
  octaves?: number; // défaut 2
  active: number[]; // touches allumées
  labels?: Record<number, string>; // ex. doigtés
}

export function Keyboard({ from = 48, octaves = 2, active, labels }: Props) {
  const whiteKeys: number[] = [];
  for (let m = from; m < from + 12 * octaves; m++) if (!BLACK.includes(m % 12)) whiteKeys.push(m);
  const w = 26;
  const h = 120;
  const set = new Set(active.map((m) => m));
  const pcSet = new Set(active.map((m) => m % 12));
  const hl = (m: number) => set.has(m);
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${whiteKeys.length * w} ${h}`} className="mx-auto h-40 w-full min-w-[320px]" role="img" aria-label="Clavier">
        {whiteKeys.map((m, i) => (
          <g key={m}>
            <rect x={i * w} y={0} width={w - 2} height={h} rx={3} className={hl(m) ? 'fill-or' : 'fill-white stroke-black/30'} />
            {labels?.[m] && <text x={i * w + w / 2} y={h - 8} textAnchor="middle" fontSize={11} className="fill-nuit">{labels[m]}</text>}
            {m % 12 === 0 && <text x={i * w + 3} y={h + 12} fontSize={9} className="fill-current opacity-60">{`C${Math.floor(m / 12) - 1}`}</text>}
          </g>
        ))}
        {whiteKeys.map((m, i) => {
          const nxt = m + 1;
          if (!BLACK.includes(nxt % 12) || nxt >= from + 12 * octaves) return null;
          return (
            <rect key={`b${nxt}`} x={i * w + w * 0.65} y={0} width={w * 0.7} height={h * 0.6} rx={2}
              className={hl(nxt) ? 'fill-or' : 'fill-nuit'} />
          );
        })}
      </svg>
      <p className="mt-1 text-center text-xs opacity-60">
        Notes actives : {[...pcSet].map((p) => noteName(spellPc(p) as Note)).join(' · ') || '—'}
      </p>
    </div>
  );
}
