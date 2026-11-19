'use client';

import { Suspense, type ReactNode } from 'react';
import { useCustomerShell } from '@/features/customer/useCustomerShell';
import { CustomerShell } from '@/ui/customer/CustomerShell';

// usePathname() is runtime-only data. With Cache Components it must sit under <Suspense>, so the hook lives in an inner component.
function CustomerLayoutInner({ children }: { children: ReactNode }) {
  return <CustomerShell {...useCustomerShell()}>{children}</CustomerShell>;
}

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <CustomerLayoutInner>{children}</CustomerLayoutInner>
    </Suspense>
  );
}
