'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { CANVAS, LOOK_CONFIG as CFG } from './config';

type Props = {
  src?: string;
  alt?: string;
  priority?: boolean;
};

export default function LookingWrap({
  src = '/hero/hero-character3.png',
  alt = 'A wrap character in a beret sipping a milkshake and looking around',
  priority = true,
}: Props) {
  const fxRef = useRef<SVGSVGElement>(null);
  const pupilL = useRef<SVGGElement>(null);
  const pupilR = useRef<SVGGElement>(null);
  const groupL = useRef<SVGGElement>(null);
  const groupR = useRef<SVGGElement>(null);

  useEffect(() => {
    const fx = fxRef.current;
    if (!fx || !pupilL.current || !pupilR.current || !groupL.current || !groupR.current) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gL = groupL.current;
    const gR = groupR.current;
    const linesL = Array.from(gL.children) as SVGLineElement[];
    const linesR = Array.from(gR.children) as SVGLineElement[];

    const eyes = CFG.eyes.map((e, i) => ({
      ...e,
      maxX: e.r - e.rx,
      maxY: e.r - e.ry,
      ox: e.rest.x - e.cx,
      oy: e.rest.y - e.cy,
      el: i === 0 ? pupilL.current! : pupilR.current!,
    }));

    let tx = CFG.idleTargets[0].x;
    let ty = CFG.idleTargets[0].y;
    let prevX = tx;
    let prevY = ty;
    let lastMove = -Infinity;
    let lastIdle = 0;
    let idleI = 0;
    let flick = 0;
    let rightMix = 0;
    let raf = 0;

    const toStage = (cx: number, cy: number) => {
      const b = fx.getBoundingClientRect();
      return { x: ((cx - b.left) * CANVAS.w) / b.width, y: ((cy - b.top) * CANVAS.h) / b.height };
    };
    const onMove = (e: PointerEvent) => {
      const p = toStage(e.clientX, e.clientY);
      tx = p.x;
      ty = p.y;
      lastMove = performance.now();
    };
    const onLeave = () => {
      lastMove = -Infinity;
    };

    const setLines = (
      group: SVGGElement,
      lines: SVGLineElement[],
      side: { x: number; y: number; dir: number; yClamp: [number, number] },
      mix: number,
      t: number,
    ) => {
      group.setAttribute('opacity', mix.toFixed(3));
      if (mix < 0.01) return;
      const yShift = Math.max(side.yClamp[0], Math.min(side.yClamp[1], (ty - side.y) * 0.18));
      const conv = { x: CFG.head.x, y: CFG.head.y - 40 + yShift };
      const pulse = reduce ? 0 : Math.sin(t / 240) * 5;
      lines.forEach((ln, i) => {
        const o = CFG.lineOffsets[i];
        const sx = side.x + o.dx * -side.dir;
        const sy = side.y + o.dy + yShift;
        const vx = conv.x - sx;
        const vy = conv.y - sy;
        const vl = Math.hypot(vx, vy) || 1;
        const ux = vx / vl;
        const uy = vy / vl;
        const start = pulse + flick;
        const x1 = sx + ux * start;
        const y1 = sy + uy * start;
        const len = CFG.lineLen - Math.abs(i - 1) * 6;
        ln.setAttribute('x1', String(x1));
        ln.setAttribute('y1', String(y1));
        ln.setAttribute('x2', String(x1 + ux * len));
        ln.setAttribute('y2', String(y1 + uy * len));
      });
    };

    const frame = (t: number) => {
      const active = t - lastMove < CFG.idleAfterMs;
      if (!active && !reduce && t - lastIdle > 2200 + (idleI % 3) * 500) {
        idleI = (idleI + 1) % CFG.idleTargets.length;
        tx = CFG.idleTargets[idleI].x;
        ty = CFG.idleTargets[idleI].y;
        lastIdle = t;
      }

      const speed = Math.hypot(tx - prevX, ty - prevY);
      prevX = tx;
      prevY = ty;
      flick += ((reduce ? 0 : Math.min(26, speed * 0.35)) - flick) * 0.18;

      eyes.forEach((e) => {
        const dx = tx - e.cx;
        const dy = ty - e.cy;
        const d = Math.hypot(dx, dy) || 1;
        const f = Math.min(1, d / 220);
        e.ox += ((dx / d) * f * e.maxX - e.ox) * 0.16;
        e.oy += ((dy / d) * f * e.maxY - e.oy) * 0.16;
        e.el.setAttribute('transform', `translate(${e.cx + e.ox} ${e.cy + e.oy})`);
      });

      const wantRight = tx > CFG.head.x ? 1 : 0;
      rightMix += (wantRight - rightMix) * 0.12;
      setLines(gL, linesL, CFG.sides.left, 1 - rightMix, t);
      setLines(gR, linesR, CFG.sides.right, rightMix, t);

      raf = requestAnimationFrame(frame);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const [eL, eR] = CFG.eyes;

  const lineProps = { stroke: '#2f4c9a', strokeWidth: 6, strokeLinecap: 'round' as const };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Image
        src={src}
        alt={alt}
        width={CANVAS.w}
        height={CANVAS.h}
        priority={priority}
        sizes="(max-width: 1040px) 1040px, 100vw"
        draggable={false}
        style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none' }}
      />
      <svg
        ref={fxRef}
        viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
        aria-hidden="true"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
      >
        <defs>
          <clipPath id="lw-eye-l">
            <circle cx={eL.cx} cy={eL.cy} r={eL.r - 2} />
          </clipPath>
          <clipPath id="lw-eye-r">
            <circle cx={eR.cx} cy={eR.cy} r={eR.r - 2} />
          </clipPath>
        </defs>

        <g ref={groupL}>
          <line {...lineProps} />
          <line {...lineProps} />
          <line {...lineProps} />
        </g>
        <g ref={groupR} opacity="0">
          <line {...lineProps} />
          <line {...lineProps} />
          <line {...lineProps} />
        </g>

        <g clipPath="url(#lw-eye-l)">
          <g ref={pupilL}>
            <ellipse rx={eL.rx} ry={eL.ry} fill="#0b0b0d" />
            <circle cx={-eL.rx * 0.4} cy={-eL.ry * 0.4} r="7" fill="#fff" />
          </g>
        </g>
        <g clipPath="url(#lw-eye-r)">
          <g ref={pupilR}>
            <ellipse rx={eR.rx} ry={eR.ry} fill="#0b0b0d" />
            <circle cx={-eR.rx * 0.4} cy={-eR.ry * 0.4} r="7" fill="#fff" />
          </g>
        </g>
      </svg>
    </div>
  );
}