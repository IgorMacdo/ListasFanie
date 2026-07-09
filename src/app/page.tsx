'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Gift } from '@/types';
import { GiftCard } from '@/components/GiftCard';
import { ReservationModal } from '@/components/ReservationModal';

// Lista de presentes mockada para fallback inicial (quando o Supabase não está configurado)
const INITIAL_MOCK_GIFTS: Gift[] = [
  { id: '1', name: 'Banheira Ergonômica', description: 'sugestão de cor: Branca ou Cinza', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '2', name: 'Bebê Conforto', description: 'Para passear de carro com segurança', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '3', name: 'Fralda Descartável (Tamanho P)', description: 'Qualquer marca de boa qualidade', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '4', name: 'Fralda Descartável (Tamanho M)', description: 'Qualquer marca de boa qualidade', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '5', name: 'Fralda Descartável (Tamanho G)', description: 'Qualquer marca de boa qualidade', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '6', name: 'Kit Body Manga Curta (3 unidades)', description: 'Tamanho M - Algodão antialérgico', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '7', name: 'Kit Body Manga Longa (3 unidades)', description: 'Tamanho G - Estampas neutras', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '8', name: 'Manta de Soft Hipoalergênica', description: 'Toque macio para aquecer o bebê', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '9', name: 'Kit Higiene Completo', description: 'Pente, escova macia, cortador de unha', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '10', name: 'Termômetro Digital de Testa', description: 'Leitura rápida e precisa', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
];

export default function GuestPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [filter, setFilter] = useState<'all' | 'available' | 'reserved'>('all');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verifica se o Supabase está configurado corretamente
  const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key && !url.includes('placeholder') && !key.includes('placeholder');
  };

  const fetchGifts = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      // Usa fallback no localStorage
      setIsUsingMock(true);
      const savedGifts = localStorage.getItem('lists_fanie_gifts');
      if (savedGifts) {
        setGifts(JSON.parse(savedGifts));
      } else {
        localStorage.setItem('lists_fanie_gifts', JSON.stringify(INITIAL_MOCK_GIFTS));
        setGifts(INITIAL_MOCK_GIFTS);
      }
      setLoading(false);
      return;
    }

    try {
      setIsUsingMock(false);
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setGifts(data || []);
    } catch (err) {
      console.warn('Erro ao conectar ao Supabase, alternando para modo LocalStorage:', err);
      setIsUsingMock(true);
      const savedGifts = localStorage.getItem('lists_fanie_gifts') || JSON.stringify(INITIAL_MOCK_GIFTS);
      setGifts(JSON.parse(savedGifts));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();

    // Configura o Realtime apenas se estiver usando a base do Supabase
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('gifts-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gifts' },
          () => {
            fetchGifts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleReserveClick = (gift: Gift) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const handleConfirmReservation = async (giftId: string, guestName: string) => {
    if (isUsingMock) {
      // Grava no localStorage localmente
      const updatedGifts = gifts.map((g) =>
        g.id === giftId
          ? { ...g, is_reserved: true, reserved_by: guestName, reserved_at: new Date().toISOString() }
          : g
      );
      setGifts(updatedGifts);
      localStorage.setItem('lists_fanie_gifts', JSON.stringify(updatedGifts));
      return;
    }

    // Grava no Supabase
    const { error } = await supabase
      .from('gifts')
      .update({
        is_reserved: true,
        reserved_by: guestName,
        reserved_at: new Date().toISOString(),
      })
      .eq('id', giftId);

    if (error) {
      throw error;
    }
    await fetchGifts();
  };

  const filteredGifts = gifts.filter((gift) => {
    if (filter === 'available') return !gift.is_reserved;
    if (filter === 'reserved') return gift.is_reserved;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col pb-20">
      {/* Hero Header */}
      <header className="relative overflow-hidden py-16 text-center">
        {/* Enfeites de fundo decorativos */}
        <div className="absolute -top-12 left-1/4 h-24 w-24 rounded-full bg-pink-100/50 blur-xl" />
        <div className="absolute -bottom-6 right-1/4 h-32 w-32 rounded-full bg-sky-100/50 blur-xl" />

        <div className="relative mx-auto max-w-2xl px-4">
          <span className="text-4xl">👼</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl md:text-5xl bg-gradient-to-r from-sky-400 to-pink-400 bg-clip-text text-transparent">
            Chá de Revelação
          </h1>
          <p className="mt-3 text-lg font-medium text-slate-500">
            Seja bem-vindo(a) à nossa lista de presentes! Escolha um item abaixo e nos ajude a preparar a chegada do nosso amor.
          </p>

          {isUsingMock && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200">
              <span>💡</span>
              <span>Modo Demonstrativo (LocalStorage ativo). Configure o Supabase para salvar na nuvem!</span>
            </div>
          )}
        </div>
      </header>

      {/* Grid e Filtros */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Abas de filtro */}
        <div className="flex justify-center border-b border-slate-200 pb-px">
          <div className="flex gap-6">
            {(['all', 'available', 'reserved'] as const).map((type) => {
              const label = type === 'all' ? 'Todos os Itens' : type === 'available' ? 'Disponíveis' : 'Já Escolhidos';
              const active = filter === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`border-b-2 px-1 pb-4 text-sm font-semibold transition-all ${
                    active
                      ? 'border-pink-400 text-pink-500'
                      : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading ou Grid */}
        {loading ? (
          <div className="mt-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-slate-500 font-medium">Buscando lista de presentes...</p>
          </div>
        ) : (
          <>
            {filteredGifts.length === 0 ? (
              <div className="mt-16 text-center rounded-2xl border border-dashed border-slate-200 bg-white/40 p-12">
                <span className="text-3xl">📭</span>
                <p className="mt-3 text-sm text-slate-500 font-medium">Nenhum item encontrado nesta categoria.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredGifts.map((gift) => (
                  <GiftCard
                    key={gift.id}
                    gift={gift}
                    onReserve={handleReserveClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Reserva */}
      <ReservationModal
        gift={selectedGift}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmReservation}
      />
    </div>
  );
}
