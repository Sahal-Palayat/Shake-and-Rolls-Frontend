'use client';

import { LandingPage } from '@/ui/landing/LandingPage';
import { CTA_COPY, PICKS } from './content';
import { PickCardContainer } from './PickCardContainer';
import { useLanding } from './useLanding';

export function LandingContainer() {
  const props = useLanding();
  return (
    <LandingPage
      {...props}
      picks={PICKS.map((p, i) => (
        <PickCardContainer
          key={p.id}
          label={p.label}
          imageSrc={p.imageSrc}
          rotation={p.rotation}
          waiterSrc={i === 0 ? CTA_COPY.waiterSrc : null}
        />
      ))}
    />
  );
}
