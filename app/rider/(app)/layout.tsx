'use client';

import { Suspense, type ReactNode } from 'react';
import { useRiderShell } from '@/features/rider/useRiderShell';
import { RiderShell } from '@/ui/rider/RiderShell';

function RiderLayoutInner({ children }: { children: ReactNode }) {
  return <RiderShell {...useRiderShell()}>{children}</RiderShell>;
}

export default function RiderLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RiderLayoutInner>{children}</RiderLayoutInner>
    </Suspense>
  );
}
