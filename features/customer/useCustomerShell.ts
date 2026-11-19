import { useRouter, usePathname } from 'next/navigation';
import type { CustomerShellProps } from '@/ui/customer/CustomerShell';
import { useCustomerSession } from '@/features/auth/useCustomerAuth';
import { clearSession } from '@/features/auth/session';
import { cartActions } from '@/features/cart/cartStore';

export function useCustomerShell(): Omit<CustomerShellProps, 'children'> {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const { session } = useCustomerSession();
  const onMenu = pathname === '/';
  return {
    brandLabel: 'Shakes & Rolls',
    brandHref: '/',
    tagline: 'Wraps, shakes and loaded fries',
    navItems: [
      { href: '/', label: 'Menu', isActive: onMenu },
      { href: '/orders', label: 'My orders', isActive: pathname === '/orders' || pathname.startsWith('/orders/') },
    ],
    signOut: session
      ? {
          label: 'Sign out',
          onClick: () => {
            clearSession();
            cartActions.closeDrawer();
            router.push('/');
          },
        }
      : undefined,
    onNavigate: (href) => router.push(href),
  };
}
