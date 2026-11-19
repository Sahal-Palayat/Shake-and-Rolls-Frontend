'use client';

import { useEffect, useRef } from 'react';
import { wavePathAt } from './geometry';

/** Animates the CTA wave path. Pauses off-screen; static under reduced motion. */
export function useWaveAnimation() {
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
      if (visible) path.setAttribute('d', wavePathAt((now - start) / 1000));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '200px' });
    io.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return { sectionRef, pathRef };
}
