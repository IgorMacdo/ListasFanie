'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, insira a senha.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Recarrega a página para atualizar o estado do middleware/cookie e redirecionar
        router.refresh();
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Senha incorreta.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {/* Decorações */}
      <div className="absolute -top-10 left-1/3 h-48 w-48 rounded-full bg-pink-100/40 blur-2xl" />
      <div className="absolute -bottom-10 right-1/3 h-48 w-48 rounded-full bg-sky-100/40 blur-2xl" />

      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl animate-fade-in relative z-10">
        <div className="text-center">
          <span className="text-4xl">🔑</span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-800">
            Acesso Organizadora
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Insira a senha do painel para gerenciar a lista de enxoval da casa nova.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Senha de Acesso
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all text-slate-800"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium">
              ⚠️ {error}
            </p>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 to-pink-400 py-3 text-sm font-semibold text-white hover:from-sky-500 hover:to-pink-500 shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
