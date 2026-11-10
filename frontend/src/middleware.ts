import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Sliding-window in-memory map for Next.js Edge
const ipRequestTimestamps = new Map<string, number[]>();

export function middleware(request: NextRequest) {
  // Owner portal + CRM gate: no Django session cookie -> team login page.
  // (Django still checks the session, staff flag and CRM role on every API call.)
  // Trailing slashes are not normalized (skipTrailingSlashRedirect), so "/owner/login/"
  // must count as the login page too, or it redirects to itself forever.
  const pathname = request.nextUrl.pathname.replace(/\/+$/, '') || '/';
  const isPortal = pathname === '/owner' || pathname.startsWith('/owner/') || pathname === '/crm' || pathname.startsWith('/crm/');
  if (isPortal && pathname !== '/owner/login' && !request.cookies.get('sessionid')) {
    // Fresh URL so the original trailing slash is not carried over
    const url = new URL('/owner/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();

  // 1. Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 2. Edge Rate Limiting on /api/* routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim() : (realIp || '127.0.0.1');
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 100; // 100 requests per minute per IP

    const timestamps = ipRequestTimestamps.get(ip) || [];
    const validTimestamps = timestamps.filter(t => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
      const resetInSeconds = Math.ceil((windowMs - (now - validTimestamps[0])) / 1000);
      return new NextResponse(
        JSON.stringify({
          success: false,
          data: null,
          message: `Too many requests from IP ${ip}. Please wait ${resetInSeconds} seconds.`,
          errors: { rate_limit: "Edge Rate Limit Exceeded" }
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(resetInSeconds),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(resetInSeconds),
          }
        }
      );
    }

    validTimestamps.push(now);
    ipRequestTimestamps.set(ip, validTimestamps);

    const remaining = maxRequests - validTimestamps.length;
    response.headers.set('X-RateLimit-Limit', String(maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|videos|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)',
  ],
};
