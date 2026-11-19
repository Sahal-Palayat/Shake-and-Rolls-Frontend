import type { CSSProperties, ReactNode } from 'react';

// Pure drawing. All text, positions that vary, and generated paths arrive as props.

const VB_DEFAULT_FADE_RADIUS = 1000;

const ORANGE = 'var(--lp-orange)';
const YELLOW = 'var(--lp-yellow)';
const INK = 'var(--lp-ink)';
const WHITE = 'var(--lp-white)';

const svgStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'visible',
};

const outline = { stroke: WHITE, strokeLinejoin: 'round' as const, paintOrder: 'stroke' as const };
const chunky: CSSProperties = { fontFamily: 'var(--font-chunky), sans-serif' };
const condensed: CSSProperties = { fontFamily: 'var(--font-condensed), Impact, sans-serif' };

const css = `
@keyframes sr-rotate  { to { transform: rotate(360deg); } }
@keyframes sr-drop    { from { opacity: 0; transform: translateY(-90px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sr-pop     { 0% { opacity: 0; transform: scale(0) rotate(-14deg); } 70% { opacity: 1; transform: scale(1.12) rotate(2deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes sr-bob     { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes sr-float   { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-16px) rotate(8deg); } }
@keyframes sr-twinkle { 0%,100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(.55) rotate(45deg); opacity: .75; } }

.sr-spin, .sr-pop, .sr-bob, .sr-float, .sr-twinkle { transform-box: fill-box; transform-origin: center; }
.sr-rays    { transform-box: view-box; animation: sr-rotate 160s linear infinite; }
.sr-spin    { animation: sr-rotate 16s linear infinite; }
.sr-drop    { animation: sr-drop .85s cubic-bezier(.2,.9,.3,1.15) both; }
.sr-pop     { animation: sr-pop .7s cubic-bezier(.3,1.4,.5,1) both; }
.sr-bob     { animation: sr-bob 4s ease-in-out infinite; }
.sr-float   { animation: sr-float 7s ease-in-out infinite; }
.sr-twinkle { animation: sr-twinkle 3s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .sr-rays, .sr-spin, .sr-drop, .sr-pop, .sr-bob, .sr-float, .sr-twinkle { animation: none !important; }
}
`;

/* ---------- specs (the contract) ---------- */

export type SparkleSpec = { id: string; x: number; y: number; rotate: number; delay: number; path: string };
export type StickerSpec = {
  id: string;
  x: number;
  y: number;
  rotate: number;
  delay: number;
  fontSize: number;
  lines: { text: string; y: number }[];
};
export type BadgeSpec = {
  x: number;
  y: number;
  radius: number;
  innerRadius: number;
  delay: number;
  label: string;
  ringPath: string;
  ringTextLength: number;
  sparklePath: string;
};
export type GiantWordSpec = { id: string; text: string; x: number; width: number; delay: number };

export type HeroTextsBackProps = {
  viewBox: string;
  sunburst: { cx: number; cy: number; transformOrigin: string; path: string };
  words: GiantWordSpec[];
};

export type HeroTextsFrontProps = {
  viewBox: string;
  heading: string;
  stickers: StickerSpec[];
  badge: BadgeSpec;
  sparkles: SparkleSpec[];
};

/* ---------- pieces ---------- */

function Sparkle(s: SparkleSpec) {
  return (
    <g transform={`translate(${s.x} ${s.y}) rotate(${s.rotate})`}>
      <g className="sr-twinkle" style={{ animationDelay: `${s.delay}s` }}>
        <path d={s.path} transform="translate(4 5)" fill={INK} />
        <path d={s.path} fill={YELLOW} stroke={WHITE} strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" />
      </g>
    </g>
  );
}

function Sticker(s: StickerSpec) {
  return (
    <g transform={`translate(${s.x} ${s.y}) rotate(${s.rotate})`}>
      <g className="sr-pop" style={{ animationDelay: `${s.delay}s` }}>
        <g className="sr-bob" style={{ animationDelay: `${s.delay}s` }}>
          <g textAnchor="middle" fontSize={s.fontSize} style={chunky}>
            <g transform="translate(6 8)" fill={INK} stroke={INK} strokeWidth="18" strokeLinejoin="round" paintOrder="stroke">
              {s.lines.map((l) => <text key={l.text} y={l.y}>{l.text}</text>)}
            </g>
            <g fill={YELLOW} strokeWidth="18" {...outline}>
              {s.lines.map((l) => <text key={l.text} y={l.y}>{l.text}</text>)}
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

function Badge(b: BadgeSpec) {
  return (
    <g transform={`translate(${b.x} ${b.y})`}>
      <g className="sr-pop" style={{ animationDelay: `${b.delay}s` }}>
        <circle r={b.radius} transform="translate(6 8)" fill={INK} />
        <circle r={b.radius} fill={YELLOW} stroke={INK} strokeWidth="5" />
        <g className="sr-spin">
          <circle r={b.innerRadius} fill="none" />
          <defs><path id="sr-badge-ring" d={b.ringPath} /></defs>
          <text fontSize="25" fill={INK} letterSpacing="2" style={condensed}>
            <textPath href="#sr-badge-ring" textLength={b.ringTextLength} lengthAdjust="spacing">
              {b.label}
            </textPath>
          </text>
        </g>
        <g className="sr-twinkle">
          <path d={b.sparklePath} transform="translate(4 5)" fill={INK} />
          <path d={b.sparklePath} fill={YELLOW} stroke={WHITE} strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" />
        </g>
      </g>
    </g>
  );
}

function Confetti({ x, y, rotate = 0, dur = 7, delay = 0, children }: { x: number; y: number; rotate?: number; dur?: number; delay?: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <g className="sr-float" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        {children}
      </g>
    </g>
  );
}

const giant = {
  y: 660,
  fontSize: 590,
  strokeWidth: 18,
  lengthAdjust: 'spacingAndGlyphs' as const,
  style: { fontFamily: 'var(--font-display), Impact, sans-serif' } as CSSProperties,
  ...outline,
};

function Word({ x, width, text, delay }: { x: number; width: number; text: string; delay: number }) {
  return (
    <g className="sr-drop" style={{ animationDelay: `${delay}s` }}>
      <text x={x} textLength={width} {...giant} fill={INK} stroke={INK} transform="translate(10 12)">{text}</text>
      <text x={x} textLength={width} {...giant} fill={ORANGE}>{text}</text>
    </g>
  );
}

const wave = { fill: 'none', stroke: ORANGE, strokeWidth: 7, strokeLinecap: 'round' as const };
const triangle = { fill: YELLOW, stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const };

/** Goes BEHIND the character image: background + giant words */
export function HeroTextsBack(p: HeroTextsBackProps) {
  return (
    <svg viewBox={p.viewBox} aria-hidden="true" style={{ ...svgStyle, zIndex: 0 }}>
      <style>{css}</style>

      <defs>
        <radialGradient id="sr-fade-grad" gradientUnits="userSpaceOnUse" cx={p.sunburst.cx} cy={p.sunburst.cy} r={VB_DEFAULT_FADE_RADIUS}>
          <stop offset="0" stopColor="var(--lp-white)" />
          <stop offset="1" stopColor="var(--lp-black)" />
        </radialGradient>
        <mask id="sr-fade" maskUnits="userSpaceOnUse" x="-300" y="-300" width="2600" height="1700">
          <rect x="-300" y="-300" width="2600" height="1700" fill="url(#sr-fade-grad)" />
        </mask>
      </defs>

      <g mask="url(#sr-fade)">
        <g className="sr-rays" style={{ transformOrigin: p.sunburst.transformOrigin }}>
          <path d={p.sunburst.path} fill="var(--lp-sunburst)" opacity=".55" />
        </g>
      </g>

      <Confetti x={190} y={770} dur={7}><path d="M-30,0 q10,-16 20,0 t20,0 t20,0 t20,0" {...wave} /></Confetti>
      <Confetti x={420} y={830} rotate={15} dur={8} delay={1}><path d="M0,-22 L22,18 L-22,18 Z" {...triangle} /></Confetti>
      <Confetti x={600} y={770} dur={6} delay={0.5}><circle r="16" {...wave} /></Confetti>
      <Confetti x={130} y={860} dur={9} delay={2}><path d="M-14,0 H14 M0,-14 V14" stroke={INK} strokeWidth="7" strokeLinecap="round" /></Confetti>

      <Confetti x={1560} y={800} dur={7} delay={0.8}><path d="M-30,0 q10,-16 20,0 t20,0 t20,0 t20,0" {...wave} /></Confetti>
      <Confetti x={1750} y={850} rotate={-12} dur={8} delay={1.4}><path d="M0,-22 L22,18 L-22,18 Z" {...triangle} /></Confetti>
      <Confetti x={1430} y={850} dur={6} delay={0.2}><circle r="16" {...wave} /></Confetti>
      <Confetti x={1840} y={770} dur={9} delay={2.2}>
        <circle cx="-14" r="5" fill={INK} /><circle r="5" fill={INK} /><circle cx="14" r="5" fill={INK} />
      </Confetti>

      {p.words.map((w) => (
        <Word key={w.id} x={w.x} width={w.width} text={w.text} delay={w.delay} />
      ))}
    </svg>
  );
}

/** Goes IN FRONT of the character image */
export function HeroTextsFront(p: HeroTextsFrontProps) {
  return (
    <>
      <h1 className="sr-only">{p.heading}</h1>
      <svg viewBox={p.viewBox} aria-hidden="true" style={{ ...svgStyle, zIndex: 2 }}>
        <style>{css}</style>
        {p.stickers.map((s) => <Sticker key={s.id} {...s} />)}
        <Badge {...p.badge} />
        {p.sparkles.map((s) => <Sparkle key={s.id} {...s} />)}
      </svg>
    </>
  );
}
