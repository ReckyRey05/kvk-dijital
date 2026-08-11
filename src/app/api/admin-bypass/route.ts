import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // A basic secret key (e.g. kvkdijitalcozumler.com/api/admin-bypass?secret=ali123)
  if (secret === 'ali123') {
    const cookieStore = await cookies();
    cookieStore.set('kvk_admin_access', 'true', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
