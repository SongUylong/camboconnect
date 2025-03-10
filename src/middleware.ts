import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Paths that require authentication
  const protectedPaths = [
    '/profile',
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

  // Add cache-control headers for opportunities page
  const response = NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/opportunities')) {
    // Don't override existing cache-control headers if they exist
    if (!response.headers.has('Cache-Control')) {
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/opportunities/:path*',
    '/profile/:path*',
    '/notifications',
    '/settings',
    '/admin/:path*',
  ],
}; 