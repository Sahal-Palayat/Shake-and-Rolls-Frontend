'use client';

import { useKitchenBoard } from '@/features/kitchen/useKitchenBoard';
import { KitchenBoard } from '@/ui/kitchen/KitchenBoard';

export default function KitchenPage() {
  return <KitchenBoard {...useKitchenBoard()} />;
}
