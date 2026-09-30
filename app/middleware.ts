import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userType = request.cookies.get('userType')?.value;

  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === '/account';
  const isDashboardPage = pathname.startsWith('/dashboard');

  // 🔒 1. Protect dashboard routes (not logged in)
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  // 🔁 2. Redirect logged-in users away from auth page
  if (isAuthPage && token) {
    const redirectPath = userType
      ? `/dashboard/${userType}`
      : '/dashboard/user'; // fallback

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // 🔐 3. Prevent accessing wrong dashboard (role protection)
  if (isDashboardPage && token && userType) {
    const correctPath = `/dashboard/${userType}`;

    // If user tries to access another role's dashboard
    if (!pathname.startsWith(correctPath)) {
      return NextResponse.redirect(new URL(correctPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account', '/dashboard/:path*'],
};