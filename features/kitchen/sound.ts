/** New-order alert via Web Audio (no asset file). Browsers block audio until a user gesture, so enable() must run from a click. */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  return ctx;
}

export async function enableSound(): Promise<boolean> {
  const c = getCtx();
  if (!c) return false;
  try {
    await c.resume();
  } catch {
    return false;
  }
  return c.state === 'running';
}

/** Three rising two-tone chimes, about 2 seconds. Loud on purpose: kitchens are noisy. */
export function playNewOrderAlert(): void {
  const c = getCtx();
  if (!c || c.state !== 'running') return;
  const start = c.currentTime + 0.02;
  for (let i = 0; i < 3; i++) {
    [880, 1175].forEach((freq, j) => {
      const t = start + i * 0.7 + j * 0.22;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }
}
