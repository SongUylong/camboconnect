import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Paths that require authentication
  const protectedPaths = [
    '/opportunities/',
    '/profile',
    '/messages',
    '/notifications',
    '/settings',
    '/admin',
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
    '/messages/:path*',
    '/notifications',
    '/settings',
    '/admin/:path*',
  ],
}; 