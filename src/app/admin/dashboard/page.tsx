'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Gift } from '@/types';
import { GiftCard } from '@/components/GiftCard';

export default function AdminDashboard() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const router = useRouter();

  // Estados do formulário de criação
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key && !url.includes('placeholder') && !key.includes('placeholder');
  };

  const fetchGifts = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setIsUsingMock(true);
      const savedGifts = localStorage.getItem('lists_fanie_gifts');
      if (savedGifts) {
        setGifts(JSON.parse(savedGifts));
      } else {
        setGifts([]);
      }
      setLoading(false);
      return;
    }

    try {
      setIsUsingMock(false);
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGifts(data || []);
    } catch (err) {
      console.warn('Erro ao conectar ao Supabase no admin, alternando para modo LocalStorage:', err);
      setIsUsingMock(true);
      const savedGifts = localStorage.getItem('lists_fanie_gifts') || '[]';
      setGifts(JSON.parse(savedGifts));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.refresh();
      router.push('/admin/login');
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
  };

  // Converte imagem para base64 para uso local
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleCreateGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('O nome do presente é obrigatório.');
      return;
    }
    setFormError('');
    setCreating(true);

    try {
      let imageUrl = '';

      if (imageFile) {
        if (isUsingMock) {
          // Converte para base64 para rodar localmente sem Supabase Storage
          imageUrl = await convertToBase64(imageFile);
        } else {
          // Upload para o Supabase Storage
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `gifts/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('gift-images')
            .upload(filePath, imageFile);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('gift-images')
            .getPublicUrl(filePath);

          imageUrl = data.publicUrl;
        }
      }

      if (isUsingMock) {
        const newGift: Gift = {
          id: Math.random().toString(36).substring(2) + Date.now(),
          name: name.trim(),
          description: description.trim() || null,
          image_url: imageUrl || null,
          is_reserved: false,
          reserved_by: null,
          reserved_at: null,
          created_at: new Date().toISOString(),
        };

        const updatedGifts = [newGift, ...gifts];
        setGifts(updatedGifts);
        localStorage.setItem('lists_fanie_gifts', JSON.stringify(updatedGifts));
      } else {
        const { error } = await supabase.from('gifts').insert({
          name: name.trim(),
          description: description.trim() || null,
          image_url: imageUrl || null,
        });

        if (error) throw error;
        await fetchGifts();
      }

      // Limpa formulário
      setName('');
      setDescription('');
      setImageFile(null);
      // Reseta o input de arquivo visualmente
      const fileInput = document.getElementById('gift-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: unknown) {
      console.error(err);
      setFormError('Erro ao criar o presente. Verifique a conexão.');
    } finally {
      setCreating(false);
    }
  };

  const handleReleaseReservation = async (giftId: string) => {
    if (isUsingMock) {
      const updatedGifts = gifts.map((g) =>
        g.id === giftId ? { ...g, is_reserved: false, reserved_by: null, reserved_at: null } : g
      );
      setGifts(updatedGifts);
      localStorage.setItem('lists_fanie_gifts', JSON.stringify(updatedGifts));
      return;
    }

    try {
      const { error } = await supabase
        .from('gifts')
        .update({
          is_reserved: false,
          reserved_by: null,
          reserved_at: null,
        })
        .eq('id', giftId);

      if (error) throw error;
      await fetchGifts();
    } catch (err) {
      console.error(err);
      alert('Erro ao liberar reserva.');
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!confirm('Deseja realmente remover este presente da lista?')) return;

    if (isUsingMock) {
      const updatedGifts = gifts.filter((g) => g.id !== giftId);
      setGifts(updatedGifts);
      localStorage.setItem('lists_fanie_gifts', JSON.stringify(updatedGifts));
      return;
    }

    try {
      const { error } = await supabase.from('gifts').delete().eq('id', giftId);
      if (error) throw error;
      await fetchGifts();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir presente.');
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-20">
      {/* Header administrativo */}
      <header className="bg-white border-b border-slate-100 py-6 shadow-sm">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              ⚙️ Painel de Controle Fanie
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie a lista de enxoval da casa nova
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              Ver Site
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 active:scale-[0.98] transition-all"
            >
              Sair do Painel
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 grid gap-8 lg:grid-cols-3">
        
        {/* Formulário de cadastro de presente */}
        <section className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              ➕ Cadastrar Presente
            </h2>

            <form onSubmit={handleCreateGift} className="space-y-4">
              <div>
                <label htmlFor="gift-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nome do Item
                </label>
                <input
                  type="text"
                  id="gift-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Fralda M (Pacote)"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all text-slate-800"
                  disabled={creating}
                />
              </div>

              <div>
                <label htmlFor="gift-desc" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Observações / Dicas
                </label>
                <textarea
                  id="gift-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Sugestão de cor azul, tamanho M"
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all text-slate-800"
                  disabled={creating}
                />
              </div>

              <div>
                <label htmlFor="gift-image" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Foto do Item (Opcional)
                </label>
                <input
                  type="file"
                  id="gift-image"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="mt-2 w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                  disabled={creating}
                />
              </div>

              {formError && (
                <p className="text-xs text-rose-500 font-medium">
                  ⚠️ {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-gradient-to-r from-sky-400 to-pink-400 py-3 text-sm font-semibold text-white hover:from-sky-500 hover:to-pink-500 shadow-sm active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {creating ? 'Salvando...' : 'Adicionar à Lista'}
              </button>
            </form>
          </div>
        </section>

        {/* Listagem de presentes para gerenciamento */}
        <section className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                📋 Presentes na Lista ({gifts.length})
              </h2>
              {isUsingMock && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                  Modo Local ativo
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-400 border-r-transparent align-[-0.125em]" />
                <p className="mt-4 text-sm text-slate-500 font-medium">Buscando itens...</p>
              </div>
            ) : (
              <>
                {gifts.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-100 rounded-xl">
                    <span className="text-3xl">📭</span>
                    <p className="mt-3 text-sm text-slate-400">Nenhum presente cadastrado ainda.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {gifts.map((gift) => (
                      <GiftCard
                        key={gift.id}
                        gift={gift}
                        isAdmin={true}
                        onRelease={handleReleaseReservation}
                        onDelete={handleDeleteGift}
                        onReserve={() => {}}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
