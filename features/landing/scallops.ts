import type { HeroWavesProps } from '@/ui/landing/HeroWaves';

// Props builder for the (currently unused) HeroWaves band.
const W = 1440;
const H = 190;

type Row = { id: string; tone: 'orange' | 'brown' | 'dark'; base: number; ry: number; n: number; offset: number; secs: number; dir: 'l' | 'r' };

const ROWS: Row[] = [
  { id: 'orange', tone: 'orange', base: 62, ry: 40, n: 4, offset: 0, secs: 7, dir: 'l' },
  { id: 'brown', tone: 'brown', base: 108, ry: 38, n: 5, offset: 0.5, secs: 6, dir: 'r' },
  { id: 'dark', tone: 'dark', base: 152, ry: 34, n: 4, offset: 0.25, secs: 8, dir: 'l' },
];

function rowPath({ base, ry, n, offset }: Row): string {
  const w = W / n;
  const start = -2 * w + offset * w;
  let d = `M${start},${H + 6} L${start},${base}`;
  for (let k = 0; k < n + 4; k++) d += ` A${w / 2},${ry} 0 0 1 ${start + (k + 1) * w},${base}`;
  return `${d} L${start + (n + 4) * w},${H + 6} Z`;
}

export function heroWavesProps(): HeroWavesProps {
  return {
    viewBox: `0 0 ${W} ${H}`,
    rows: ROWS.map((r) => ({
      id: r.id,
      path: rowPath(r),
      tone: r.tone,
      shiftPx: r.dir === 'l' ? -(W / r.n) : W / r.n,
      durationSeconds: r.secs,
      isReversed: r.dir === 'r',
    })),
  };
}
