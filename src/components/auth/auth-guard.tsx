'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { PageLoader } from '@/components/ui/loader';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run protection logic after zustand is fully hydrated from localStorage
    if (isHydrated) {
      const isAuthPath = pathname === '/' || pathname.startsWith('/login');
      
      if (!isAuthenticated && !isAuthPath) {
        // Redundant with middleware, but acts as a client-side fallback
        router.replace('/');
      }
    }
  }, [isAuthenticated, isHydrated, pathname, router]);

  // While hydration is happening, render the fullscreen loader to prevent layout flashing
  if (!isHydrated) {
    return <PageLoader />;
  }

  // If we're authenticated but hydration hasn't redirected yet, we just render children
  // (Middleware usually handles this anyway)
  return <>{children}</>;
}
