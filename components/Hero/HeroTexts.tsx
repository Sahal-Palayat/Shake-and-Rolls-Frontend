// components/Hero/HeroTexts.tsx
// Coordinate space = 1917 x 1045 (same ratio as the 1699x926 canvas).

const VB = '0 0 1917 1045';
const DROP = 170;

const ORANGE = '#FF5A01';
const YELLOW = '#FFC72C';
const INK = '#2B1A0E';

// sunburst centre = roughly behind the character
const CX = 1000;
const CY = 560;
const RAYS = 28;
const R = 1700;

const rays = Array.from({ length: RAYS }, (_, i) => {
  const a0 = (i * 2 * Math.PI) / RAYS;
  const a1 = a0 + Math.PI / RAYS;
  const p = (a: number) => `${(CX + R * Math.cos(a)).toFixed(1)},${(CY + R * Math.sin(a)).toFixed(1)}`;
  return `M${CX},${CY} L${p(a0)} L${p(a1)} Z`;
}).join(' ');

const svgStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'visible',
};

const outline = {
  stroke: '#fff',
  strokeLinejoin: 'round' as const,
  paintOrder: 'stroke' as const,
};

const chunky = { fontFamily: 'var(--font-chunky), sans-serif' };
const condensed = { fontFamily: 'var(--font-condensed), Impact, sans-serif' };

const css = `
@keyframes sr-rotate  { to { transform: rotate(360deg); } }
@keyframes sr-drop    { from { opacity: 0; transform: translateY(-90px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sr-pop     { 0% { opacity: 0; transform: scale(0) rotate(-14deg); } 70% { opacity: 1; transform: scale(1.12) rotate(2deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes sr-bob     { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes sr-float   { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-16px) rotate(8deg); } }
@keyframes sr-twinkle { 0%,100% { transform: scale(1) rotate(0deg); opacity: 1; } 50% { transform: scale(.55) rotate(45deg); opacity: .75; } }

.sr-spin, .sr-pop, .sr-bob, .sr-float, .sr-twinkle { transform-box: fill-box; transform-origin: center; }
.sr-rays    { transform-box: view-box; transform-origin: ${CX}px ${CY}px; animation: sr-rotate 160s linear infinite; }
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

/** 4-point sparkle (twinkles) */
function Sparkle({ x, y, s = 30, rotate = 0, delay = 0 }: { x: number; y: number; s?: number; rotate?: number; delay?: number }) {
  const d = `M0,${-s} Q0,0 ${s},0 Q0,0 0,${s} Q0,0 ${-s},0 Q0,0 0,${-s} Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <g className="sr-twinkle" style={{ animationDelay: `${delay}s` }}>
        <path d={d} transform="translate(4 5)" fill={INK} />
        <path d={d} fill={YELLOW} stroke="#fff" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" />
      </g>
    </g>
  );
}

/** Yellow sticker: pops in on load, then bobs gently */
function Sticker({
  x, y, rotate, lines, size = 62, leading = 0.88, delay = 0,
}: {
  x: number; y: number; rotate: number; lines: string[]; size?: number; leading?: number; delay?: number;
}) {
  const step = size * leading;
  const ys = lines.map((_, i) => (i - (lines.length - 1) / 2) * step);

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <g className="sr-pop" style={{ animationDelay: `${delay}s` }}>
        <g className="sr-bob" style={{ animationDelay: `${delay}s` }}>
          <g textAnchor="middle" fontSize={size} style={chunky}>
            <g transform="translate(6 8)" fill={INK} stroke={INK} strokeWidth="18" strokeLinejoin="round" paintOrder="stroke">
              {lines.map((t, i) => <text key={t} y={ys[i]}>{t}</text>)}
            </g>
            <g fill={YELLOW} strokeWidth="18" {...outline}>
              {lines.map((t, i) => <text key={t} y={ys[i]}>{t}</text>)}
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

/** Spinning circular badge */
function Badge({ x, y, r = 84, delay = 0 }: { x: number; y: number; r?: number; delay?: number }) {
  const pr = r - 24;
  const ring = `M0,${pr} a${pr},${pr} 0 1,1 0,${-2 * pr} a${pr},${pr} 0 1,1 0,${2 * pr}`;

  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="sr-pop" style={{ animationDelay: `${delay}s` }}>
        <circle r={r} transform="translate(6 8)" fill={INK} />
        <circle r={r} fill={YELLOW} stroke={INK} strokeWidth="5" />
        <g className="sr-spin">
          <circle r={r - 6} fill="none" />
          <defs><path id="sr-badge-ring" d={ring} /></defs>
          <text fontSize="25" fill={INK} letterSpacing="2" style={condensed}>
            <textPath href="#sr-badge-ring" textLength={2 * Math.PI * pr - 6} lengthAdjust="spacing">
              FRESH • ROLLED • DAILY •
            </textPath>
          </text>
        </g>
        <Sparkle x={0} y={0} s={26} />
      </g>
    </g>
  );
}

/** Drifting Memphis-style confetti for the background */
function Confetti({
  x, y, rotate = 0, dur = 7, delay = 0, children,
}: {
  x: number; y: number; rotate?: number; dur?: number; delay?: number; children: React.ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <g className="sr-float" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        {children}
      </g>
    </g>
  );
}

const giant = {
  y: 490 + DROP,
  fontSize: 590,
  fill: ORANGE,
  strokeWidth: 18,
  lengthAdjust: 'spacingAndGlyphs' as const,
  style: { fontFamily: 'var(--font-display), Impact, sans-serif' },
  ...outline,
};

/** Giant word with a hard offset shadow, drops in on load */
function Word({ x, w, text, delay }: { x: number; w: number; text: string; delay: number }) {
  return (
    <g className="sr-drop" style={{ animationDelay: `${delay}s` }}>
      <text x={x} textLength={w} {...giant} fill={INK} stroke={INK} transform="translate(10 12)">{text}</text>
      <text x={x} textLength={w} {...giant}>{text}</text>
    </g>
  );
}

/** Goes BEHIND the character image: background + giant words */
export function HeroTextsBack() {
  return (
    <svg viewBox={VB} aria-hidden="true" style={{ ...svgStyle, zIndex: 0 }}>
      <style>{css}</style>

      <defs>
        <radialGradient id="sr-fade-grad" gradientUnits="userSpaceOnUse" cx={CX} cy={CY} r="1000">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id="sr-fade" maskUnits="userSpaceOnUse" x="-300" y="-300" width="2600" height="1700">
          <rect x="-300" y="-300" width="2600" height="1700" fill="url(#sr-fade-grad)" />
        </mask>
      </defs>

      {/* slow sunburst, strongest behind the character, fading outwards */}
      <g mask="url(#sr-fade)">
        <g className="sr-rays">
          <path d={rays} fill="#E8CFA6" opacity=".55" />
        </g>
      </g>

      {/* confetti in the empty band above the wave */}
      <Confetti x={190} y={770} dur={7}>
        <path d="M-30,0 q10,-16 20,0 t20,0 t20,0 t20,0" fill="none" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" />
      </Confetti>
      <Confetti x={420} y={830} rotate={15} dur={8} delay={1}>
        <path d="M0,-22 L22,18 L-22,18 Z" fill={YELLOW} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      </Confetti>
      <Confetti x={600} y={770} dur={6} delay={0.5}>
        <circle r="16" fill="none" stroke={ORANGE} strokeWidth="7" />
      </Confetti>
      <Confetti x={130} y={860} dur={9} delay={2}>
        <path d="M-14,0 H14 M0,-14 V14" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      </Confetti>

      <Confetti x={1560} y={800} dur={7} delay={0.8}>
        <path d="M-30,0 q10,-16 20,0 t20,0 t20,0 t20,0" fill="none" stroke={ORANGE} strokeWidth="7" strokeLinecap="round" />
      </Confetti>
      <Confetti x={1750} y={850} rotate={-12} dur={8} delay={1.4}>
        <path d="M0,-22 L22,18 L-22,18 Z" fill={YELLOW} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      </Confetti>
      <Confetti x={1430} y={850} dur={6} delay={0.2}>
        <circle r="16" fill="none" stroke={ORANGE} strokeWidth="7" />
      </Confetti>
      <Confetti x={1840} y={770} dur={9} delay={2.2}>
        <circle cx="-14" r="5" fill={INK} /><circle r="5" fill={INK} /><circle cx="14" r="5" fill={INK} />
      </Confetti>

      {/* each word owns a gutter; the character overlaps only the inner edge of SHAKES */}
      <Word x={48} w={650} text="WRAPS" delay={0.1} />
      <Word x={1340} w={530} text="SHAKES" delay={0.3} />
    </svg>
  );
}

/** Goes IN FRONT of the character image */
export function HeroTextsFront() {
  return (
    <>
      <h1 className="sr-only">Wraps &amp; Shakes. Rolled fresh. Freshly made. Seriously loaded.</h1>
      <svg viewBox={VB} aria-hidden="true" style={{ ...svgStyle, zIndex: 2 }}>
        <style>{css}</style>

        <Sticker x={330} y={125 + DROP} rotate={-11} lines={['ROLLED', 'FRESH']} delay={0.7} />
        <Sticker x={1700} y={705} rotate={8} lines={['THICK &', 'LOADED']} delay={0.9} />

        <Badge x={620} y={140} delay={1.1} />

        <Sparkle x={705} y={700} s={26} rotate={-8} />
        <Sparkle x={1560} y={760} s={30} rotate={10} delay={1.2} />
      </svg>
    </>
  );
}