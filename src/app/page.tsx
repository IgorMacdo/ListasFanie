'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Gift } from '@/types';
import { GiftCard } from '@/components/GiftCard';
import { ReservationModal } from '@/components/ReservationModal';

// Lista de presentes mockada para fallback inicial (quando o Supabase não está configurado)
const INITIAL_MOCK_GIFTS: Gift[] = [
  { id: '1', name: 'Balde', description: 'Balde plástico reforçado (sugestão: 10L ou 15L)', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '2', name: 'Cesto de roupas', description: 'Cesto organizador para roupas sujas ou limpas', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '3', name: 'Escova de limpeza', description: 'Escova com cerdas firmes para lavanderia', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '4', name: 'Ferro de passar', description: 'Ferro de passar roupas a vapor ou seco', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '5', name: 'Máquina (lava e seca)', description: 'Ajuda de custo para a máquina de lavar e secar', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '6', name: 'Mop de limpeza', description: 'Mop giratório ou spray com refil microfibra', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '7', name: 'Pá de lixo', description: 'Pá de lixo resistente com cabo longo', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '8', name: 'Pano de chão', description: 'Kit com panos de chão de algodão alvejado', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '9', name: 'Pano de limpeza/estopa', description: 'Kit de panos de microfibra multiuso', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '10', name: 'Porta-sabão', description: 'Organizador ou porta-sabão em pó/líquido para lavanderia', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '11', name: 'Prateleiras ou Torre de limpeza', description: 'Organizador vertical para produtos de limpeza', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '12', name: 'Kit de Pregador de roupa', description: 'Pregadores de madeira ou plástico resistentes', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '13', name: 'Vassoura', description: 'Vassoura de pelo macio para pisos internos', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '14', name: 'Rodo', description: 'Rodo duplo com borracha EVA aderente', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '15', name: 'Sapateira', description: 'Sapateira organizadora para o hall ou quarto', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '16', name: 'Tábua de passar', description: 'Tábua de passar roupas dobrável e acolchoada', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() },
  { id: '17', name: 'Varal (chão ou embutir)', description: 'Varal dobrável de chão ou varal de teto/embutido', image_url: '', is_reserved: false, reserved_by: null, reserved_at: null, created_at: new Date().toISOString() }
];

export default function GuestPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [filter, setFilter] = useState<'all' | 'available' | 'reserved'>('all');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados do temporizador regressivo
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  // Efeito para o countdown
  useEffect(() => {
    setIsMounted(true);
    // Data alvo: 14 de Setembro de 2026 às 15:00h
    const targetDate = new Date('2026-09-14T15:00:00-03:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleScrollToGifts = () => {
    document.getElementById('gifts-section')?.scrollIntoView({ behavior: 'smooth' });
  };

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
      const savedGifts = localStorage.getItem('lists_fanie_house_gifts');
      if (savedGifts) {
        setGifts(JSON.parse(savedGifts));
      } else {
        localStorage.setItem('lists_fanie_house_gifts', JSON.stringify(INITIAL_MOCK_GIFTS));
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
      const savedGifts = localStorage.getItem('lists_fanie_house_gifts') || JSON.stringify(INITIAL_MOCK_GIFTS);
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

  const handleConfirmReservation = async (
    giftId: string, 
    guestName: string, 
    guestPhone: string, 
    contributionType: 'link' | 'qrcode'
  ) => {
    if (isUsingMock) {
      // Grava no localStorage localmente
      const updatedGifts = gifts.map((g) =>
        g.id === giftId
          ? { 
              ...g, 
              is_reserved: true, 
              reserved_by: guestName, 
              reserved_phone: guestPhone,
              contribution_type: contributionType,
              reserved_at: new Date().toISOString() 
            }
          : g
      );
      setGifts(updatedGifts);
      localStorage.setItem('lists_fanie_house_gifts', JSON.stringify(updatedGifts));
      return;
    }

    // Grava no Supabase
    const { error } = await supabase
      .from('gifts')
      .update({
        is_reserved: true,
        reserved_by: guestName,
        reserved_phone: guestPhone,
        contribution_type: contributionType,
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
      <header className="relative overflow-hidden py-10 md:py-16">
        {/* Enfeites de fundo decorativos */}
        <div className="absolute -top-12 left-1/4 h-24 w-24 rounded-full bg-pastel-green/30 blur-xl animate-pulse" />
        <div className="absolute -bottom-6 right-1/4 h-32 w-32 rounded-full bg-pastel-yellow/30 blur-xl animate-pulse" />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Coluna 1: Imagem do Convite */}
            <div className="flex justify-center md:justify-end">
              <div className="relative group max-w-sm w-full transition-all duration-500 ease-out hover:scale-[1.02] hover:-rotate-1">
                {/* Efeito de sombra/borda brilhante decorativa */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-pastel-green via-pastel-yellow to-pastel-red opacity-50 blur-lg transition duration-1000 group-hover:opacity-75 group-hover:duration-200" />
                <div className="relative overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/convite.png" 
                    alt="Convite Enxoval de Casa Nova - Sthefanie e Daniel" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Coluna 2: Informações e Countdown */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pastel-green/30 px-4 py-1 text-sm font-semibold text-emerald-800 border border-pastel-green/50">
                🏡 Chá de Casa Nova
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl md:text-6xl">
                <span className="block text-slate-800">Sthefanie &</span>
                <span className="block mt-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">Daniel</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-600 max-w-md">
                Venha celebrar conosco e conhecer nosso novo lar! Escolha um item abaixo na lista de presentes para nos ajudar a montar nossa casa.
              </p>

              {/* Event Info Cards */}
              <div className="mt-6 w-full max-w-md grid gap-3 grid-cols-3">
                <div className="glass p-3 rounded-xl text-center shadow-xs">
                  <div className="text-xl">📅</div>
                  <div className="text-[11px] font-bold text-slate-400 mt-1 uppercase">Data</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">14 Set</div>
                </div>
                <div className="glass p-3 rounded-xl text-center shadow-xs">
                  <div className="text-xl">🕒</div>
                  <div className="text-[11px] font-bold text-slate-400 mt-1 uppercase">Hora</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">15:00h</div>
                </div>
                <div className="glass p-3 rounded-xl text-center shadow-xs">
                  <div className="text-xl">📍</div>
                  <div className="text-[11px] font-bold text-slate-400 mt-1 uppercase">Local</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5 truncate" title="Rua Alegre, 123, Joinville - SC">Joinville</div>
                </div>
              </div>

              {/* Countdown Timer */}
              {isMounted && (
                <div className="mt-8 w-full max-w-md">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center md:text-left mb-3">
                    Contagem Regressiva para o Chá:
                  </h3>
                  <div className="flex justify-center md:justify-start gap-3">
                    {[
                      { label: 'Dias', value: timeLeft.days },
                      { label: 'Horas', value: timeLeft.hours },
                      { label: 'Min', value: timeLeft.minutes },
                      { label: 'Seg', value: timeLeft.seconds },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="glass h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center rounded-xl shadow-sm border border-white">
                          <span className="text-xl sm:text-2xl font-black text-slate-700 font-mono tracking-tight">
                            {String(item.value).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call To Action */}
              <div className="flex flex-col sm:flex-row gap-4 items-center mt-8">
                <button 
                  onClick={handleScrollToGifts}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-700/30 hover:scale-[1.02] cursor-pointer"
                >
                  <span>Ver Lista de Presentes</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {isUsingMock && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-[10px] font-semibold text-amber-800 shadow-xs">
                    <span>💡 Modo Demo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grid e Filtros */}
      <main id="gifts-section" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-8">
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
                      ? 'border-pastel-red text-rose-700'
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
