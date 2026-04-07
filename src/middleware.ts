import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/', '/login/email'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a static file or api route (skip)
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // We check for a dummy cookie that we set on login 
  // since this is a mock and localStorage isn't available here
  const token = request.cookies.get('dem-token')?.value;
  const isPublicPath = publicPaths.includes(pathname);
  const isAuthPage = pathname.startsWith('/login');

  // 1. If user is logged in and tries to access public auth paths, redirect to dashboard
  if (token && (isPublicPath || isAuthPage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If user is NOT logged in and tries to access protected paths, redirect to home/login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
