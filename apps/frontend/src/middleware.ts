import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/'];

const roleRoutes: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/users': ['ADMIN'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('jurix-auth');

  if (!authCookie?.value) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const authData = JSON.parse(authCookie.value);

    if (authData.state?.user) {
      const userRole = authData.state.user.role;

      for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
        if (pathname.startsWith(route) && !allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
  } catch {
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/health).*)',
  ],
};
