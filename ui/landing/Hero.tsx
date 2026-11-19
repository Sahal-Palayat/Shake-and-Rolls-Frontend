import { HeroTextsBack, HeroTextsFront, type HeroTextsBackProps, type HeroTextsFrontProps } from './HeroTexts';
import { LookingWrap, type LookingWrapProps } from './LookingWrap';
import { Navbar, type NavbarProps } from './Navbar';

export type HeroProps = {
  ariaLabel: string;
  navbar: NavbarProps;
  lookingWrap: LookingWrapProps;
  textsBack: HeroTextsBackProps;
  textsFront: HeroTextsFrontProps;
};

const css = `
.sr-hero{position:relative;overflow:hidden;background:var(--lp-cream);color:var(--lp-ink);
  --W:max(min(100vw,calc(100svh * 1.8346),1900px),1040px);}
.sr-hero__stage{position:relative;width:var(--W);left:calc((100vw - var(--W)) / 2);}
@media (max-width:1040px){
  .sr-hero__stage{left:max(calc(100vw - var(--W)), calc(50vw - 0.58 * var(--W)));}
}`;

export function Hero(p: HeroProps) {
  return (
    <>
      <Navbar {...p.navbar} />
      <section className="sr-hero" aria-label={p.ariaLabel}>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="sr-hero__stage">
          <HeroTextsBack {...p.textsBack} />
          <LookingWrap {...p.lookingWrap} />
          <HeroTextsFront {...p.textsFront} />
        </div>
      </section>
    </>
  );
}
