export const ctaContentCss = `
.sr-ctac{display:flex;flex-direction:column;align-items:center;text-align:center;}
.sr-ctac__title{margin:0;font-family:var(--font-chunky),sans-serif;font-weight:400;line-height:.95;
  font-size:clamp(44px,8vw,120px);color:var(--lp-white);letter-spacing:.01em;
  -webkit-text-stroke:.09em var(--lp-ink);paint-order:stroke fill;
  text-shadow:.06em .08em 0 var(--lp-ink);}

.sr-ctac__btn{margin-top:clamp(18px,2.4vw,32px);border:3px solid var(--lp-ink);border-radius:26px 14px 28px 16px;
  background:var(--lp-yellow);color:var(--lp-ink);padding:.5em 1.5em;cursor:pointer;
  font-family:var(--font-lilita),sans-serif;font-size:clamp(20px,2.2vw,32px);text-transform:uppercase;letter-spacing:.05em;
  box-shadow:5px 5px 0 var(--lp-ink);transform:rotate(-2deg);transition:transform .2s,box-shadow .2s;}
.sr-ctac__btn:hover{transform:translate(2px,2px) rotate(0) scale(1.05);box-shadow:3px 3px 0 var(--lp-ink);}
.sr-ctac__btn:active{transform:translate(5px,5px);box-shadow:0 0 0 var(--lp-ink);}

.sr-ctac__gallery{--w:clamp(110px,16vw,250px);position:relative;display:flex;justify-content:center;align-items:flex-start;
  width:100%;margin-top:clamp(70px,10vw,150px);}

.sr-pickwrap{position:relative;width:clamp(150px,25vw,400px);flex:none;}
.sr-pickwrap:hover{z-index:6;}
.sr-ctac__gallery > .sr-pickwrap + .sr-pickwrap{margin-left:-1.5%;}
.sr-pick{position:relative;width:100%;}
.sr-pick__inner{position:relative;aspect-ratio:4/5;border:6px solid var(--lp-white);border-radius:30px 18px 32px 20px;overflow:hidden;
  background:var(--lp-cream);box-shadow:10px 12px 0 var(--lp-ink);will-change:transform;}
.sr-pick__inner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;}
.sr-pick__ph{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  color:var(--lp-wave-brown);font-family:var(--font-display),sans-serif;font-size:clamp(16px,1.8vw,26px);
  background:repeating-linear-gradient(135deg,var(--lp-cream) 0 14px,var(--lp-stripe) 14px 28px);}
.sr-pick__ph svg{width:36%;height:auto;opacity:.55;}

.sr-waiter{position:absolute;z-index:3;width:var(--w);pointer-events:none;
  right:calc(100% - var(--w) * .2);bottom:calc(100% - var(--w) * .12);}
.sr-waiter__slap{position:relative;opacity:0;transform-origin:50% 100%;}
.sr-waiter__slap img{display:block;width:100%;height:auto;user-select:none;
  filter:drop-shadow(5px 7px 0 var(--lp-ink));}
.sr-waiter__ring{position:absolute;left:50%;bottom:3%;width:95%;aspect-ratio:3/1;border:5px solid var(--lp-white);border-radius:50%;
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
  .sr-waiter{right:auto;left:calc(100% - var(--w) * .8);}
}
`;
