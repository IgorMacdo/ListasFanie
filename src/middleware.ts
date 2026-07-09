import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthenticated = token === 'fanie_authenticated_token';

  // Protege a rota do Dashboard
  if (pathname.startsWith('/admin/dashboard')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // Redireciona para o dashboard se tentar acessar o login já autenticado
  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
