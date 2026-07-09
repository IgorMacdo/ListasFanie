import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || 'fanieadmin123';

    if (password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      
      // Define o cookie de autenticação por 7 dias
      response.cookies.set('admin_token', 'fanie_authenticated_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
