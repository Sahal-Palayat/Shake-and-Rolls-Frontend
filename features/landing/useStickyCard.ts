'use client';

import { useEffect, useRef } from 'react';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Card follows the pointer a little, then lets go. Skipped on touch devices. */
export function useStickyCard(rotation: number) {
  const slotRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = slotRef.current;
    const n = innerRef.current;
    if (!s || !n) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      n.style.transform = `rotate(${rotation}deg)`;
      return;
    }

    let x = 0, y = 0, tx = 0, ty = 0, k = 0.14, raf = 0, hold = 0;

    const draw = () => {
      x += (tx - x) * k;
      y += (ty - y) * k;
      const pull = Math.min(1, Math.hypot(x, y) / 40);
      n.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rotation + x * 0.1}deg) scale(${1 + pull * 0.05})`;
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(draw);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => {
      clearTimeout(hold);
      const r = s.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) * 0.4, -42, 42);
      ty = clamp((e.clientY - (r.top + r.height / 2)) * 0.4, -42, 42);
      k = 0.14;
      kick();
    };
    const onLeave = () => {
      hold = window.setTimeout(() => {
        tx = 0;
        ty = 0;
        k = 0.07;
        kick();
      }, 700);
    };

    n.style.transform = `rotate(${rotation}deg)`;
    s.addEventListener('pointermove', onMove);
    s.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hold);
      s.removeEventListener('pointermove', onMove);
      s.removeEventListener('pointerleave', onLeave);
    };
  }, [rotation]);

  return { slotRef, innerRef };
}
