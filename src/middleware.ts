import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Allow access to the coming-soon page and any static assets
  // if (
  //   request.nextUrl.pathname === '/coming-soon' ||
  //   request.nextUrl.pathname.startsWith('/_next/') ||
  //   request.nextUrl.pathname.startsWith('/api/') ||
  //   request.nextUrl.pathname.startsWith('/static/') ||
  //   request.nextUrl.pathname.startsWith('/images/') ||
  //   request.nextUrl.pathname === '/loaderio-3eef899fa214518d3995640c27c21967.txt'
  // ) {
  //   return NextResponse.next();
  // }

  // Redirect all other traffic to coming-soon page
  // const url = new URL('/coming-soon', request.url);
  // return NextResponse.redirect(url);

  // Original authentication logic preserved for future use
  const token = await getToken({ 
    req: request,
    secureCookie: false
  });
  
  const protectedPaths = [
    '/opportunities/',
    '/profile',
    '/notifications',
    '/settings',
    '/admin',
    '/friends',
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
    '/((?!api|_next/static|_next/image|favicon.ico|loaderio-3eef899fa214518d3995640c27c21967.txt).*)',
  ],
};