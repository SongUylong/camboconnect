import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secureCookie: false // Set to false for IP address
  });
  
  // Paths that require authentication
  const protectedPaths = [
    '/opportunities/',
    '/profile',
    '/notifications',
    '/settings',
    '/admin',
    '/friends',
    '/community',
  ];
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/opportunities/:path*',
    '/profile/:path*',
    '/notifications',
    '/settings',
    '/admin/:path*',
    '/friends/:path*',
    '/community/:path*',
  ],
}; 