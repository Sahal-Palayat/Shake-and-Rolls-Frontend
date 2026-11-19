import type { ReactNode } from 'react';
import LookingWrap from '../LookingWrap/LookingWrap';
import Navbar from '../Navbar/Navbar';
import { HeroTextsBack, HeroTextsFront } from './HeroTexts';
import HeroWaves from './HeroWaves';

type HeroProps = {
  nav?: ReactNode;
  headline?: ReactNode;
  actions?: ReactNode;
  imageSrc?: string;
  debugSlots?: boolean;
};

// Styles live here on purpose, so the hero looks right even if CSS Modules
// or global styles in your project behave differently.
const css = `
.sr-hero{position:relative;overflow:hidden;background:#F4E7D2;color:#2B1A0E;
  --W:max(min(100vw,calc(100svh * 1.8346),1900px),1040px);}
.sr-hero__stage{position:relative;width:var(--W);left:calc((100vw - var(--W)) / 2);}
.sr-hero__slots{position:absolute;inset:0;z-index:2;display:grid;grid-template-rows:auto 1fr auto;
  padding:clamp(16px,3vw,40px);pointer-events:none;}
.sr-hero__slot{pointer-events:auto;}
.sr-hero__nav{grid-row:1;}
.sr-hero__headline{grid-row:2;align-self:center;max-width:min(34vw,460px);}
.sr-hero__actions{grid-row:3;justify-self:start;padding-bottom:clamp(16px,4vw,48px);}
.sr-hero--debug .sr-hero__slot{outline:2px dashed #2F4C9A;min-height:48px;}
@media (max-width:1040px){
  .sr-hero__stage{left:max(calc(100vw - var(--W)), calc(50vw - 0.58 * var(--W)));}
  .sr-hero__headline{max-width:70vw;align-self:start;padding-top:16px;}
}`;

export default function Hero({ nav, headline, actions, imageSrc, debugSlots = false }: HeroProps) {
  return (
    <>
    <Navbar/>
    
    <section className={`sr-hero ${debugSlots ? 'sr-hero--debug' : ''}`} aria-label="Shake&Rolls">
      
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="sr-hero__stage">
        <HeroTextsBack />
        <LookingWrap src={imageSrc} />
        <HeroTextsFront />
      </div>

      <div className="sr-hero__slots">
        {/* <div className="sr-hero__slot sr-hero__nav">{nav}</div> */}
        {/* <div className="sr-hero__slot sr-hero__headline">{headline}</div> */}
        {/* <div className="sr-hero__slot sr-hero__actions">{actions}</div> */}
      </div>
      {/* <HeroWaves/> */}
    </section>
    </>
  );
}