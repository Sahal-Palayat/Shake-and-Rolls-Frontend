import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cartActions } from './cartStore';

export function useCartRoute() {
  const router = useRouter();
  useEffect(() => {
    cartActions.openDrawer();
    router.replace('/');
  }, [router]);
}
