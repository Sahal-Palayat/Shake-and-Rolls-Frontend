'use client';

import { useMenuScreen } from '@/features/menu/useMenuScreen';
import { MenuScreen } from '@/ui/menu/MenuScreen';

export default function MenuPage() {
  return <MenuScreen {...useMenuScreen()} />;
}
