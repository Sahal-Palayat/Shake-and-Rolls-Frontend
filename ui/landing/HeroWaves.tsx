export type HeroWaveTone = 'orange' | 'brown' | 'dark';

export type HeroWaveRow = {
  id: string;
  path: string;
  tone: HeroWaveTone;
  /** Signed horizontal travel in px; the sign sets the direction. */
  shiftPx: number;
  durationSeconds: number;
  isReversed: boolean;
};

export type HeroWavesProps = {
  viewBox: string;
  rows: HeroWaveRow[];
};

const toneFill: Record<HeroWaveTone, string> = {
  orange: 'var(--lp-wave-orange)',
  brown: 'var(--lp-wave-brown)',
  dark: 'var(--lp-wave-dark)',
};

const css = `
@keyframes sr-scallop-l { from { transform: translateX(0); } to { transform: translateX(var(--shift)); } }
@keyframes sr-scallop-r { from { transform: translateX(var(--shift)); } to { transform: translateX(0); } }
.sr-waves{position:absolute;left:0;right:0;bottom:-1px;z-index:1;pointer-events:none;
  height:clamp(80px,13vw,260px);overflow:hidden;}
.sr-waves svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}
.sr-waves__row{animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-direction:alternate;}
@media (prefers-reduced-motion: reduce){ .sr-waves__row{animation:none !important;} }
`;

export function HeroWaves(p: HeroWavesProps) {
  return (
    <div className="sr-waves" aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <svg viewBox={p.viewBox} preserveAspectRatio="none">
        {p.rows.map((r) => (
          <path
            key={r.id}
            className="sr-waves__row"
            d={r.path}
            fill={toneFill[r.tone]}
            stroke="var(--lp-white)"
            strokeWidth="9"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{
              ['--shift' as string]: `${r.shiftPx}px`,
              animationName: r.isReversed ? 'sr-scallop-r' : 'sr-scallop-l',
              animationDuration: `${r.durationSeconds}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
