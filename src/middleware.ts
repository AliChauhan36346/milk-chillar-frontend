import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/UserManagement'];

function decodeJWT(token: string) {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }
  
  export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;
  
    if (PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.next();
    }
  
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  
    const decoded = decodeJWT(token);
  
    // ✅ Pull role from the proper claim
    const userRole =
      decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?.toLowerCase();
  
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  
    if (pathname.startsWith('/dashboard/manager') && userRole !== 'manager') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  
    if (pathname.startsWith('/dashboard/dodhi') && userRole !== 'dodhi') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  
    return NextResponse.next();
  }
  

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/public).*)',
  ],
}
