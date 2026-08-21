import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files, Next.js internal files and health check routes pass through
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|avif|css|js|woff|woff2|ttf|txt)$/)
  ) {
    return NextResponse.next();
  }

  // Admin bypass cookie check if needed
  const hasAdminBypass = request.cookies.has("kvk_maintenance_bypass");
  if (hasAdminBypass) {
    return NextResponse.next();
  }

  // Redirect all other URLs to the maintenance homepage
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
