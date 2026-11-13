import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = ['/', '/random', '/gallery', '/minigame', '/music', '/chat', '/pins', '/goals', '/space'];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const hasSession = request.cookies.has('our-space-session');

  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) {
          return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
      }
    }
  }

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/random/:path*', '/gallery/:path*', '/minigame/:path*', '/music/:path*', '/chat/:path*', '/pins/:path*', '/goals/:path*', '/space/:path*', '/api/:path*'],
};
