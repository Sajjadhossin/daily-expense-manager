'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PageLoader } from '@/components/ui/loader';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      const isAuthPath = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register');
      
      if (!isAuthPath) {
        router.replace('/');
      }
    }
  }, [status, pathname, router]);

  if (status === 'loading') {
    return <PageLoader />;
  }

  // If we're authenticated but hydration hasn't redirected yet, we just render children
  // (Middleware usually handles this anyway)
  return <>{children}</>;
}
