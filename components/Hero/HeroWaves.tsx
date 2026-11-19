// components/Hero/HeroWaves.tsx
// Chunky scalloped bands (orange / brown / black) with thick white outlines.
// Covers the bottom of the character image, sits UNDER the WRAP/SHAKE text.

export const NEXT_BG = '#1A0F08'; // give the next section this background so it flows on

const W = 1440;
const H = 190;

type Row = {
  fill: string;
  base: number;   // where the scallops meet (smaller = higher up)
  ry: number;     // scallop roundness / height
  n: number;      // scallops across the screen
  offset: number; // 0..1 of one scallop, staggers the rows like roof tiles
  secs: number;   // sway duration
  dir: 'l' | 'r';
};

const ROWS: Row[] = [
  { fill: '#FB923C', base: 62,  ry: 40, n: 4, offset: 0,    secs: 7, dir: 'l' }, // orange-400
  { fill: '#7C2D12', base: 108, ry: 38, n: 5, offset: 0.5,  secs: 6, dir: 'r' }, // brown
  { fill: NEXT_BG,   base: 152, ry: 34, n: 4, offset: 0.25, secs: 8, dir: 'l' }, // black
];

// Path covers 2 extra scallops each side so it can slide a full scallop without gaps.
function rowPath({ base, ry, n, offset }: Row) {
  const w = W / n;
  const start = -2 * w + offset * w;
  let d = `M${start},${H + 6} L${start},${base}`;
  for (let k = 0; k < n + 4; k++) {
    d += ` A${w / 2},${ry} 0 0 1 ${start + (k + 1) * w},${base}`;
  }
  return `${d} L${start + (n + 4) * w},${H + 6} Z`;
}

const css = `
@keyframes sr-scallop-l { from { transform: translateX(0); } to { transform: translateX(var(--shift)); } }
@keyframes sr-scallop-r { from { transform: translateX(var(--shift)); } to { transform: translateX(0); } }
.sr-waves{position:absolute;left:0;right:0;bottom:-1px;z-index:1;pointer-events:none;
  height:clamp(80px,13vw,260px);overflow:hidden;}
.sr-waves svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}
.sr-waves__row{animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-direction:alternate;}
@media (prefers-reduced-motion: reduce){ .sr-waves__row{animation:none !important;} }
`;

export default function HeroWaves() {
  return (
    <div className="sr-waves" aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {ROWS.map((r, i) => {
          const w = W / r.n;
          return (
            <path
              key={i}
              className="sr-waves__row"
              d={rowPath(r)}
              fill={r.fill}
              stroke="#fff"
              strokeWidth="9"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{
                ['--shift' as string]: `${r.dir === 'l' ? -w : w}px`,
                animationName: r.dir === 'l' ? 'sr-scallop-l' : 'sr-scallop-r',
                animationDuration: `${r.secs}s`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}