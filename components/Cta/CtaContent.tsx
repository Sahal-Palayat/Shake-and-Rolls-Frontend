'use client';
// components/Cta/CtaContent.tsx
import { useEffect, useRef, type ReactNode } from 'react';

const STICKER_SRC = '/sticker/waiter.png'; // transparent png in /public/sticker/

const PICKS: { label: string; src: string | null; rot: number }[] = [
  { label: 'Image 1', src: '/CTA/1.jpg', rot: -4 },
  { label: 'Image 2', src: '/CTA/2.jpg', rot: 2 },
  { label: 'Image 3', src: '/CTA/3.jpg', rot: 5 },
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const css = `
.sr-ctac{display:flex;flex-direction:column;align-items:center;text-align:center;}
.sr-ctac__title{margin:0;font-family:var(--font-chunky),sans-serif;font-weight:400;line-height:.95;
  font-size:clamp(44px,8vw,120px);color:#fff;letter-spacing:.01em;
  -webkit-text-stroke:.09em #2B1A0E;paint-order:stroke fill;
  text-shadow:.06em .08em 0 #2B1A0E;}

.sr-ctac__btn{margin-top:clamp(18px,2.4vw,32px);border:3px solid #2B1A0E;border-radius:26px 14px 28px 16px;
  background:#FFC72C;color:#2B1A0E;padding:.5em 1.5em;cursor:pointer;
  font-family:var(--font-lilita),sans-serif;font-size:clamp(20px,2.2vw,32px);text-transform:uppercase;letter-spacing:.05em;
  box-shadow:5px 5px 0 #2B1A0E;transform:rotate(-2deg);transition:transform .2s,box-shadow .2s;}
.sr-ctac__btn:hover{transform:translate(2px,2px) rotate(0) scale(1.05);box-shadow:3px 3px 0 #2B1A0E;}
.sr-ctac__btn:active{transform:translate(5px,5px);box-shadow:0 0 0 #2B1A0E;}

.sr-ctac__gallery{--w:clamp(110px,16vw,250px);position:relative;display:flex;justify-content:center;align-items:flex-start;
  width:100%;margin-top:clamp(70px,10vw,150px);}

.sr-pickwrap{position:relative;width:clamp(150px,25vw,400px);flex:none;}
.sr-pickwrap:hover{z-index:6;}
.sr-ctac__gallery > .sr-pickwrap + .sr-pickwrap{margin-left:-1.5%;}
.sr-pick{position:relative;width:100%;}
.sr-pick__inner{position:relative;aspect-ratio:4/5;border:6px solid #fff;border-radius:30px 18px 32px 20px;overflow:hidden;
  background:#F4E7D2;box-shadow:10px 12px 0 #2B1A0E;will-change:transform;}
.sr-pick__inner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
.sr-pick__ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  color:#7C2D12;font-family:var(--font-display),sans-serif;font-size:clamp(16px,1.8vw,26px);
  background:repeating-linear-gradient(135deg,#F4E7D2 0 14px,#F9EEDC 14px 28px);}
.sr-pick__ph svg{width:36%;height:auto;opacity:.55;}

/* waiter: slaps onto the first card's top-left corner (about 20% of him overlaps the card) */
.sr-waiter{position:absolute;z-index:3;width:var(--w);pointer-events:none;
  right:calc(100% - var(--w) * .2);bottom:calc(100% - var(--w) * .12);}
.sr-waiter__slap{position:relative;opacity:0;transform-origin:50% 100%;}
.sr-waiter__slap img{display:block;width:100%;height:auto;user-select:none;
  filter:drop-shadow(5px 7px 0 #2B1A0E);}
.sr-waiter__ring{position:absolute;left:50%;bottom:3%;width:95%;aspect-ratio:3/1;border:5px solid #fff;border-radius:50%;
  opacity:0;transform:translate(-50%,50%) scale(.2);}

.is-in .sr-waiter__slap{animation:sr-slap .95s cubic-bezier(.3,.1,.4,1) .15s both;}
.is-in .sr-waiter__ring{animation:sr-ring .6s ease-out .62s both;}

@keyframes sr-slap{
  0%  {opacity:0;transform:translateY(-150px) rotate(-28deg) scale(1.7);animation-timing-function:cubic-bezier(.55,0,1,.6);}
  35% {opacity:1;}
  50% {opacity:1;transform:translateY(0) rotate(-9deg) scale(1);animation-timing-function:ease-out;}
  62% {transform:translateY(0) rotate(-9deg) scale(1.16,.82);}
  76% {transform:translateY(0) rotate(-9deg) scale(.96,1.07);}
  88% {transform:translateY(0) rotate(-9deg) scale(1.02,.98);}
  100%{opacity:1;transform:translateY(0) rotate(-9deg) scale(1);}
}
@keyframes sr-ring{
  0%  {opacity:.9;transform:translate(-50%,50%) scale(.2);}
  100%{opacity:0;transform:translate(-50%,50%) scale(1.6);}
}

@media (prefers-reduced-motion:reduce){
  .sr-waiter__slap{opacity:1;transform:rotate(-9deg);animation:none !important;}
  .sr-waiter__ring{display:none;}
}

@media (max-width:700px){
  .sr-ctac__gallery{--w:min(30vw,130px);flex-direction:column;align-items:center;gap:22px;margin-top:calc(var(--w) * 1.35 + 24px);}
  .sr-pickwrap{width:min(78vw,360px);}
  .sr-ctac__gallery > .sr-pickwrap + .sr-pickwrap{margin-left:0;}
  /* no room on the left on phones: he lands on the top-right corner instead */
  .sr-waiter{right:auto;left:calc(100% - var(--w) * .8);}
}
`;

/* ---------- Image card that "sticks" to the cursor, then lets go ---------- */
function PickCard({ label, src, rot, children }: { label: string; src: string | null; rot: number; children?: ReactNode }) {
  const slot = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = slot.current, n = inner.current;
    if (!s || !n) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      n.style.transform = `rotate(${rot}deg)`;
      return;
    }

    let x = 0, y = 0, tx = 0, ty = 0, k = 0.14, raf = 0, hold = 0;

    const draw = () => {
      x += (tx - x) * k;
      y += (ty - y) * k;
      const pull = Math.min(1, Math.hypot(x, y) / 40);
      n.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rot + x * 0.1}deg) scale(${1 + pull * 0.05})`;
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(draw);
      else raf = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const onMove = (e: PointerEvent) => {
      clearTimeout(hold);
      const r = s.getBoundingClientRect(); // the static slot, so it doesn't jitter
      tx = clamp((e.clientX - (r.left + r.width / 2)) * 0.4, -42, 42);
      ty = clamp((e.clientY - (r.top + r.height / 2)) * 0.4, -42, 42);
      k = 0.14;
      kick();
    };
    const onLeave = () => {
      hold = window.setTimeout(() => { tx = 0; ty = 0; k = 0.07; kick(); }, 700);
    };

    n.style.transform = `rotate(${rot}deg)`;
    s.addEventListener('pointermove', onMove);
    s.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hold);
      s.removeEventListener('pointermove', onMove);
      s.removeEventListener('pointerleave', onLeave);
    };
  }, [rot]);

  return (
    <div className="sr-pickwrap">
      <div ref={slot} className="sr-pick">
        <div ref={inner} className="sr-pick__inner">
          {src ? (
            <img src={src} alt={label} draggable={false} />
          ) : (
            <div className="sr-pick__ph">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <circle cx="12" cy="12" r="3.5" />
                <path d="M8 5l1.2-2h5.6L16 5" />
              </svg>
              {label}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------- Waiter: slaps onto the corner once, when the gallery scrolls into view ---------- */
function Waiter() {
  return (
    <div className="sr-waiter" aria-hidden="true">
      <span className="sr-waiter__ring" />
      <div className="sr-waiter__slap">
        <img src={STICKER_SRC} alt="" draggable={false} />
      </div>
    </div>
  );
}

export default function CtaContent() {
  const gallery = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gallery.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="sr-ctac">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <h2 className="sr-ctac__title">Our picks</h2>
      <button className="sr-ctac__btn">Order now</button>

      <div ref={gallery} className="sr-ctac__gallery">
        {PICKS.map((p, i) => (
          <PickCard key={p.label} {...p}>
            {i === 0 && <Waiter />}
          </PickCard>
        ))}
      </div>
    </div>
  );
}