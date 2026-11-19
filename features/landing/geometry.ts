import { SUNBURST, WAVE } from './content';

export function sunburstPath(): string {
  const { cx, cy, rays, radius } = SUNBURST;
  const pt = (a: number) => `${(cx + radius * Math.cos(a)).toFixed(1)},${(cy + radius * Math.sin(a)).toFixed(1)}`;
  return Array.from({ length: rays }, (_, i) => {
    const a0 = (i * 2 * Math.PI) / rays;
    const a1 = a0 + Math.PI / rays;
    return `M${cx},${cy} L${pt(a0)} L${pt(a1)} Z`;
  }).join(' ');
}

export function sparklePath(s: number): string {
  return `M0,${-s} Q0,0 ${s},0 Q0,0 0,${s} Q0,0 ${-s},0 Q0,0 0,${-s} Z`;
}

/** Closed circle path used for text-on-a-ring. */
export function ringPath(r: number): string {
  return `M0,${r} a${r},${r} 0 1,1 0,${-2 * r} a${r},${r} 0 1,1 0,${2 * r}`;
}

/** Vertical centring of sticker text lines. */
export function stickerLines(lines: string[], size: number, leading: number): { text: string; y: number }[] {
  const step = size * leading;
  return lines.map((text, i) => ({ text, y: (i - (lines.length - 1) / 2) * step }));
}

function waveY(i: number, t: number): number {
  const p = WAVE.points[i];
  return (
    p.base +
    p.amp * Math.sin(t * p.speed + p.phase) +
    p.amp * 0.35 * Math.sin(t * p.speed * 2.3 + p.phase * 1.9)
  );
}

/** Catmull-Rom through every control point, as cubic beziers. `t` is seconds. */
export function wavePathAt(t: number): string {
  const n = WAVE.points.length;
  const pts = WAVE.points.map((_, i) => ({ x: (i * WAVE.width) / (n - 1), y: waveY(i, t) }));
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
  return `${d} L${WAVE.width},${WAVE.height + 2} L0,${WAVE.height + 2} Z`;
}
