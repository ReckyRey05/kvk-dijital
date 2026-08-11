import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if admin cookie exists
  const hasAdminCookie = request.cookies.has('kvk_admin_access');

  // If they have the cookie, let them see the site
  if (hasAdminCookie) {
    return NextResponse.next();
  }

  // Paths that should not be blocked
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/yakinda-buradayiz' ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Everyone else gets redirected to coming-soon
  const url = request.nextUrl.clone();
  url.pathname = '/yakinda-buradayiz';
  return NextResponse.redirect(url);
}

// Only run on specific paths (exclude some static files early on)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
