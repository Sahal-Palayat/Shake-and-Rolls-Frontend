'use client';

import { PickCard } from '@/ui/landing/PickCard';
import { Waiter } from '@/ui/landing/Waiter';
import { useStickyCard } from './useStickyCard';

type Props = {
  label: string;
  imageSrc: string | null;
  rotation: number;
  waiterSrc: string | null;
};

export function PickCardContainer({ label, imageSrc, rotation, waiterSrc }: Props) {
  const { slotRef, innerRef } = useStickyCard(rotation);
  return (
    <PickCard label={label} imageSrc={imageSrc} slotRef={slotRef} innerRef={innerRef}>
      {waiterSrc ? <Waiter src={waiterSrc} /> : null}
    </PickCard>
  );
}
