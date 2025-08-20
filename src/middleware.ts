// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/unauthorized'];

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

// Add async here
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const decoded = decodeJWT(token);
  if (!decoded) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  type Role = 'admin' | 'manager' | 'dodhi' | 'chillarincharge';
  const role = (decoded?.role?.toLowerCase() ||
               decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?.toLowerCase()) as Role | undefined;

  const rolePaths: Record<Role, string> = {
    admin: '/dashboard/admin',
    manager: '/dashboard/manager',
    dodhi: '/dashboard/dodhi',
    chillarincharge: '/dashboard/ChillarIncharge'
  };

  if (role && !pathname.startsWith(rolePaths[role])) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};