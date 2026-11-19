'use client';

import { Suspense, type ReactNode } from 'react';
import { useStaffShell } from '@/features/auth/useStaffShell';
import { FullPageMessage } from '@/ui/common/FullPageMessage';
import { StaffShell } from '@/ui/staff/StaffShell';

function StaffConsoleLayoutInner({ children }: { children: ReactNode }) {
  const shell = useStaffShell();
  if (shell.phase !== 'ready') return <FullPageMessage {...shell.messageProps} />;
  return <StaffShell {...shell.shellProps}>{children}</StaffShell>;
}

export default function StaffConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StaffConsoleLayoutInner>{children}</StaffConsoleLayoutInner>
    </Suspense>
  );
}
