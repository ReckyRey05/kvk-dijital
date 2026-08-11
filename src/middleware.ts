import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Canlıya geçiş sonrası güvenlik duvarı kaldırıldı
  // İleride özel admin paneli yapılırsa buraya token kontrolü eklenecek
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
