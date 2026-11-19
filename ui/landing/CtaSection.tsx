import type { ReactNode, Ref } from 'react';

export type CtaSectionProps = {
  ariaLabel: string;
  sectionRef: Ref<HTMLElement>;
  /** Animated by the feature layer; `wavePath` is only the first frame. */
  pathRef: Ref<SVGPathElement>;
  wavePath: string;
  waveViewBox: string;
  children?: ReactNode;
};

const css = `
.sr-cta{position:relative;z-index:5;background:var(--lp-orange);color:var(--lp-white);min-height:70vh;}
.sr-cta__wave{position:absolute;left:0;right:0;bottom:calc(100% - 1px);
  height:clamp(70px,10vw,180px);pointer-events:none;}
.sr-cta__wave svg{display:block;width:100%;height:100%;}
.sr-cta__inner{position:relative;max-width:1200px;margin:0 auto;
  padding:clamp(24px,4vw,64px) clamp(16px,3vw,40px) 80px;}
`;

export function CtaSection(p: CtaSectionProps) {
  return (
    <section ref={p.sectionRef} className="sr-cta" aria-label={p.ariaLabel}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="sr-cta__wave" aria-hidden="true">
        <svg viewBox={p.waveViewBox} preserveAspectRatio="none">
          <path ref={p.pathRef} d={p.wavePath} fill="var(--lp-orange)" />
        </svg>
      </div>
      <div className="sr-cta__inner">{p.children}</div>
    </section>
  );
}
