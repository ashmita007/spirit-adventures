import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Sliding-window in-memory map for Next.js Edge
const ipRequestTimestamps = new Map<string, number[]>();

export function middleware(request: NextRequest) {
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
