import React, { useState, useEffect } from 'react';
import { Gift } from '@/types';

interface ReservationModalProps {
  gift: Gift | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (giftId: string, name: string, phone: string, contributionType: 'link' | 'qrcode') => Promise<void>;
  deliveryNote?: string;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  gift,
  isOpen,
  onClose,
  onConfirm,
  deliveryNote,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [contributionType, setContributionType] = useState<'link' | 'qrcode'>('qrcode');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText("00020126470014BR.GOV.BCB.PIX0125faniieoliveira2@gmail.com5204000053039865802BR5925Sthefanie Moraes de Olive6009SAO PAULO62140510kaWCQm73oE63042F6A");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText("faniieoliveira2@gmail.com");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Reseta os estados toda vez que o modal é aberto ou fechado
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setGuestName('');
      setGuestPhone('');
      setContributionType('qrcode');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !gift) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }
    if (!guestPhone.trim()) {
      setError('Por favor, informe seu celular para contato.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onConfirm(gift.id, guestName.trim(), guestPhone.trim(), contributionType);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError('Ocorreu um erro ao reservar o presente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white p-6 md:p-8 shadow-2xl transition-all border border-slate-100 animate-fade-in relative z-10">
        
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors z-20"
        >
          ✕
        </button>

        {/* Layout Grid Responsivo */}
        <div className="grid gap-6 md:grid-cols-5 items-stretch">
          
          {/* Coluna 1 (md:col-span-2): Imagem e Nome do Produto */}
          <div className="md:col-span-2 flex flex-col justify-center items-center bg-slate-50 rounded-2xl p-4 border border-slate-100 relative min-h-[200px] md:min-h-auto">
            {gift.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gift.image_url}
                alt={gift.name}
                className="max-h-[220px] md:max-h-[280px] w-auto object-contain rounded-xl shadow-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}
            {!gift.image_url && (
              <div className="flex flex-col items-center justify-center text-slate-400 py-6">
                <span className="text-5xl">📦</span>
                <span className="mt-2 text-xs font-semibold">Sem foto disponível</span>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Item Escolhido</span>
              <h4 className="text-base font-bold text-slate-800 mt-0.5">{gift.name}</h4>
              {gift.description && (
                <p className="text-xs text-slate-500 mt-1 max-w-[220px] line-clamp-2" title={gift.description}>
                  {gift.description}
                </p>
              )}
            </div>
          </div>

          {/* Coluna 2 (md:col-span-3): Conteúdo dos Passos */}
          <div className="md:col-span-3 flex flex-col justify-between">
                {/* PASSO 1: Formas de Contribuição */}
            {step === 1 && (
              <div className="flex-1 flex flex-col justify-between animate-fade-in">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Passo 1 de 2</span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1 uppercase">Escolher Presente</h3>
                  
                  {/* Descrição */}
                  <div className="mt-4 rounded-2xl bg-amber-50/50 border border-pastel-yellow/30 p-4">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      Você pode nos ajudar comprando este item diretamente e nos entregando no dia do evento, ou se preferir, pode enviar o valor equivalente fazendo o envio na chave pix!
                    </p>
                  </div>

                  {/* Opções de compra/pix */}
                  <div className="mt-5 space-y-4">
                    {/* Link de compra de referência */}
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Link de referência (opcional):</span>
                      {gift.buy_link ? (
                        <a 
                          href={gift.buy_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200 px-4 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-all cursor-pointer"
                        >
                          🔗 Abrir link do produto
                        </a>
                      ) : (
                        <span className="block text-xs font-semibold text-slate-400 italic mt-2">
                          Nenhum link cadastrado para este presente. Você pode comprar onde achar melhor!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão Avançar */}
                <div className="mt-8 flex justify-end border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-900 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Avançar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 2: Identificação do Convidado */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between animate-fade-in">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Passo 2 de 2</span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1 uppercase">Identifique-se e Escolha</h3>
                  
                  <div className="mt-4 space-y-4">
                    {/* Nome */}
                    <div>
                      <label htmlFor="guest-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Seu Nome Completo
                      </label>
                      <input
                        type="text"
                        id="guest-name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Ex: Maria Souza"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-pastel-yellow focus:outline-none focus:ring-2 focus:ring-pastel-yellow/20 transition-all text-slate-800"
                        autoFocus
                        disabled={loading}
                      />
                    </div>

                    {/* Celular */}
                    <div>
                      <label htmlFor="guest-phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Seu Contato (Celular)
                      </label>
                      <input
                        type="tel"
                        id="guest-phone"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Ex: (47) 99999-9999"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-pastel-yellow focus:outline-none focus:ring-2 focus:ring-pastel-yellow/20 transition-all text-slate-800"
                        disabled={loading}
                      />
                    </div>

                    {/* Forma de contribuição escolhida */}
                    <div>
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Selecione como deseja contribuir:
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${contributionType === 'qrcode' ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800 font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📳</span>
                            <span className="text-xs">QR Code / Pix</span>
                          </div>
                          <input 
                            type="radio" 
                            name="contribution_type" 
                            value="qrcode" 
                            checked={contributionType === 'qrcode'} 
                            onChange={() => setContributionType('qrcode')}
                            className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                          />
                        </label>

                        <label className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${contributionType === 'link' ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800 font-bold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔗</span>
                            <span className="text-xs">Link de Compra</span>
                          </div>
                          <input 
                            type="radio" 
                            name="contribution_type" 
                            value="link" 
                            checked={contributionType === 'link'} 
                            onChange={() => setContributionType('link')}
                            className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Conteúdo de Pagamento Condicional */}
                    {contributionType === 'qrcode' && (
                      <div className="mt-4 rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-lg animate-fade-in">
                        {/* Bloco Roxo (Nubank Style) */}
                        <div className="bg-[#7C1AEC] p-6 text-white text-center flex flex-col items-center">
                          <h4 className="text-base font-bold tracking-tight">Use o QR Code do Pix para pagar</h4>
                          <p className="text-[11px] text-white/80 mt-1 max-w-[280px] leading-relaxed">
                            Abra o app em que vai fazer a transferência, escaneie a imagem ou cole o código do QR Code
                          </p>

                          {/* Quadrado do QR Code */}
                          <div className="mt-4 rounded-2xl bg-white p-3 shadow-md inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/QRCode.jpg"
                              alt="QR Code Pix"
                              className="h-32 w-32 object-contain"
                            />
                          </div>

                          <div className="mt-4 text-xl font-bold tracking-tight">
                            R$ 0,00
                          </div>

                          {/* Botão Copiar Código */}
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="mt-4 w-full rounded-2xl bg-white py-3 text-xs font-bold text-[#7C1AEC] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shadow-sm"
                          >
                            {copiedCode ? (
                              <>
                                <span>Código Copiado!</span>
                                <span className="text-emerald-600">✅</span>
                              </>
                            ) : (
                              <>
                                <span>Copiar código do QR Code</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Bloco Branco (Chave e Conta) */}
                        <div className="p-5 bg-white text-left space-y-4">
                          <p className="text-xs font-bold text-slate-800 text-center">
                            Ou use a chave Pix
                          </p>
                          <hr className="border-slate-100" />
                          
                          <div className="space-y-3 text-xs">
                            {/* Chave Pix Row */}
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Chave Pix</span>
                              <div className="flex items-center gap-1.5 text-right">
                                <span className="font-bold text-blue-600 font-mono select-all">faniieoliveira2@gmail.com</span>
                                <button
                                  type="button"
                                  onClick={handleCopyKey}
                                  className="rounded-lg p-1 hover:bg-slate-100 transition-all cursor-pointer text-slate-400 hover:text-blue-600"
                                  title="Copiar Chave Pix"
                                >
                                  {copiedKey ? (
                                    <span className="text-emerald-500 font-bold text-[10px]">Copiado!</span>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Nome Row */}
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Nome</span>
                              <span className="font-bold text-slate-700 text-right">Sthefanie Moraes de Oliveira</span>
                            </div>

                            {/* CPF Row */}
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">CPF</span>
                              <span className="font-bold text-slate-700 text-right font-mono">***.716.974-**</span>
                            </div>

                            {/* Banco Row */}
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Banco</span>
                              <span className="font-bold text-slate-700 text-right max-w-[200px]">260 - Nu Pagamentos S.A. - Instituição de Pagamento</span>
                            </div>

                            {/* Identificador Row */}
                            <div className="flex items-start justify-between gap-4">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Identificador</span>
                              <span className="font-bold text-slate-700 text-right font-mono">kaWCQm73oE</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {contributionType === 'link' && (
                      <div className="border border-slate-100 rounded-3xl bg-slate-50/70 p-5 mt-4 shadow-sm animate-fade-in text-left space-y-3">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Link para compra online:</span>
                          {gift.buy_link ? (
                            <a 
                              href={gift.buy_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200 px-4 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-all cursor-pointer"
                            >
                              🔗 Abrir link do produto
                            </a>
                          ) : (
                            <span className="block text-xs font-semibold text-slate-450 italic mt-2">
                              Nenhum link cadastrado para este presente. Você pode comprar em qualquer loja física ou online!
                            </span>
                          )}
                        </div>

                        {deliveryNote && (
                          <div className="bg-amber-50/50 border border-pastel-yellow/30 rounded-2xl p-4 text-xs text-slate-700">
                            <span className="font-bold text-amber-800 block mb-1">📍 Endereço de Entrega:</span>
                            <p className="leading-relaxed font-medium">{deliveryNote}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="mt-3 text-xs text-rose-500 font-semibold">
                    ⚠️ {error}
                  </p>
                )}

                {/* Botões de Ação */}
                <div className="mt-8 flex gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Voltar</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-pastel-green to-pastel-yellow py-3 text-sm font-bold text-slate-800 hover:opacity-95 shadow-md shadow-pastel-yellow/10 active:scale-[0.98] transition-all disabled:opacity-55 cursor-pointer"
                  >
                    {loading ? 'Reservando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
