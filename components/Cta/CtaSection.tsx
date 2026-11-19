'use client';
// components/Cta/CtaSection.tsx
import { useEffect, useRef, type ReactNode } from 'react';

const BG = '#ff5a01';
const W = 1440;
const H = 160;

// One control point per entry. Alternating high (crest) / low (trough) bases.
// base = resting y (small = crest, large = trough), amp = how far it travels,
// speed = rad/sec, phase = offset. Different values per point => non-uniform motion.
const POINTS = [
  { base: 56,  amp: 26, speed: 0.55, phase: 0.0 },
  { base: 34,  amp: 18, speed: 0.80, phase: 1.7 },
  { base: 108, amp: 34, speed: 0.48, phase: 3.1 },
  { base: 44,  amp: 22, speed: 0.72, phase: 4.6 },
  { base: 86,  amp: 28, speed: 0.61, phase: 2.2 },
  { base: 38,  amp: 20, speed: 0.90, phase: 5.4 },
];

function yAt(i: number, t: number) {
  const p = POINTS[i];
  // main swing + a smaller second harmonic so the easing is never symmetrical
  return (
    p.base +
    p.amp * Math.sin(t * p.speed + p.phase) +
    p.amp * 0.35 * Math.sin(t * p.speed * 2.3 + p.phase * 1.9)
  );
}

// Catmull-Rom -> cubic bezier: smooth curve through every point
function buildPath(t: number) {
  const n = POINTS.length;
  const pts = POINTS.map((_, i) => ({ x: (i * W) / (n - 1), y: yAt(i, t) }));
  let d = `M${pts[0].x},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, n - 1)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x},${p2.y.toFixed(1)}`;
  }
  return `${d} L${W},${H + 2} L0,${H + 2} Z`;
}

const css = `
.sr-cta{position:relative;z-index:5;background:${BG};color:#fff;min-height:70vh;}
.sr-cta__wave{position:absolute;left:0;right:0;bottom:calc(100% - 1px);
  height:clamp(70px,10vw,180px);pointer-events:none;}
.sr-cta__wave svg{display:block;width:100%;height:100%;}
.sr-cta__inner{position:relative;max-width:1200px;margin:0 auto;
  padding:clamp(24px,4vw,64px) clamp(16px,3vw,40px) 80px;}
`;

export default function CtaSection({ children }: { children?: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const section = sectionRef.current;
    if (!path || !section) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let visible = true;
    const start = performance.now();

    const tick = (now: number) => {
      if (visible) path.setAttribute('d', buildPath((now - start) / 1000));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // pause when the wave is off-screen
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: '200px',
    });
    io.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="sr-cta" aria-label="Order">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="sr-cta__wave" aria-hidden="true">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <path ref={pathRef} d={buildPath(0)} fill={BG} />
        </svg>
      </div>

      <div className="sr-cta__inner">{children}</div>
    </section>
  );
}