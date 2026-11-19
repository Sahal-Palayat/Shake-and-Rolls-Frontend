import type { ReactNode } from 'react';
import { CtaContent, type CtaContentProps } from './CtaContent';
import { CtaSection, type CtaSectionProps } from './CtaSection';
import { Hero, type HeroProps } from './Hero';

export type LandingPageProps = {
  hero: HeroProps;
  ctaSection: Omit<CtaSectionProps, 'children'>;
  ctaContent: Omit<CtaContentProps, 'children'>;
  picks: ReactNode;
};

export function LandingPage(p: LandingPageProps) {
  return (
    <main>
      <Hero {...p.hero} />
      <CtaSection {...p.ctaSection}>
        <CtaContent {...p.ctaContent}>{p.picks}</CtaContent>
      </CtaSection>
    </main>
  );
}
