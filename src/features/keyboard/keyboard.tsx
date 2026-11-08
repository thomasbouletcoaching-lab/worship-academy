// Clavier en SVG : touches allumées (cible / juste / faux), étiquettes (doigtés), clic pour jouer.
import { midiName } from '../../theory/pitch';

const BLACK = new Set([1, 3, 6, 8, 10]);

export type Mark = 'cible' | 'juste' | 'faux' | 'joue';

interface Props {
  from?: number; // MIDI de départ (doit être un C ou un F de préférence)
  octaves?: number;
  active?: number[]; // touches « cible »
  marks?: Record<number, Mark>; // prend le pas sur `active`
  labels?: Record<number, string>;
  onKey?: (midi: number) => void;
  showNames?: boolean;
  height?: number;
}

const FILL: Record<Mark, string> = {
  cible: '#c9a24a',
  juste: '#5f9e6e',
  faux: '#b5485a',
  joue: '#7aa6d6',
};

/** Choisit une plage de 2 ou 3 octaves qui contient toutes les notes. */
export function rangeFor(midis: number[], minOctaves = 2): { from: number; octaves: number } {
  if (!midis.length) return { from: 48, octaves: minOctaves };
  const lo = Math.min(...midis);
  const hi = Math.max(...midis);
  const from = Math.floor(lo / 12) * 12;
  const octaves = Math.max(minOctaves, Math.ceil((hi + 1 - from) / 12));
  return { from, octaves: Math.min(octaves, 5) };
}

export function Keyboard({ from = 48, octaves = 2, active = [], marks, labels, onKey, showNames = false, height = 120 }: Props) {
  const end = from + 12 * octaves; // exclusif
  const whites: number[] = [];
  for (let m = from; m < end; m++) if (!BLACK.has(m % 12)) whites.push(m);
  const w = 26;
  const markOf = (m: number): Mark | undefined => marks?.[m] ?? (active.includes(m) ? 'cible' : undefined);
  const press = (m: number) => onKey?.(m);
  const interactive = !!onKey;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${whites.length * w} ${height + 14}`}
        className="mx-auto w-full select-none"
        style={{ minWidth: Math.min(whites.length * 18, 560), maxHeight: 200 }}
        role="img"
        aria-label={`Clavier, notes : ${Object.keys(marks ?? {}).map(Number).concat(active).map((m) => midiName(m)).join(' ') || 'aucune'}`}
      >
        {whites.map((m, i) => {
          const mk = markOf(m);
          return (
            <g key={m} onPointerDown={() => press(m)} style={{ cursor: interactive ? 'pointer' : 'default' }}>
              <rect x={i * w} y={0} width={w - 2} height={height} rx={3} fill={mk ? FILL[mk] : '#ffffff'} stroke="#00000040" />
              {labels?.[m] && <text x={i * w + w / 2 - 1} y={height - 10} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f1424">{labels[m]}</text>}
              {(showNames && mk) && <text x={i * w + w / 2 - 1} y={height - 26} textAnchor="middle" fontSize={9} fill="#0f1424">{midiName(m)}</text>}
              {m % 12 === 0 && <text x={i * w + 3} y={height + 11} fontSize={9} fill="currentColor" opacity={0.6}>{`C${Math.floor(m / 12) - 1}`}</text>}
            </g>
          );
        })}
        {whites.map((m, i) => {
          const b = m + 1;
          if (!BLACK.has(b % 12) || b >= end) return null;
          const mk = markOf(b);
          return (
            <g key={`b${b}`} onPointerDown={() => press(b)} style={{ cursor: interactive ? 'pointer' : 'default' }}>
              <rect x={i * w + w * 0.62} y={0} width={w * 0.72} height={height * 0.62} rx={2} fill={mk ? FILL[mk] : '#0f1424'} />
              {labels?.[b] && <text x={i * w + w * 0.98} y={height * 0.62 - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ffffff">{labels[b]}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
