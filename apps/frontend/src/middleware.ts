import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/'];

// Rotas que requerem roles específicos
const roleRoutes: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/users': ['ADMIN'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se é rota pública
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Obter token do cookie ou header
  const authCookie = request.cookies.get('jurix-auth');

  // Se não há cookie de auth e não é rota pública, redireciona para login
  if (!authCookie?.value) {
    // Para rotas de API não redireciona, apenas retorna 401
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

  // Verificar roles para rotas específicas (SSR básico)
  // Nota: validação completa acontece no cliente/servidor com o token real
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
    // Se não conseguir parsear, deixa passar e valida no cliente
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/health).*)',
  ],
};

