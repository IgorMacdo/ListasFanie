import React, { useState } from 'react';
import { Gift } from '@/types';

interface ReservationModalProps {
  gift: Gift | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (giftId: string, name: string) => Promise<void>;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  gift,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !gift) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onConfirm(gift.id, guestName.trim());
      setGuestName('');
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
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          ✕
        </button>

        <div className="text-center">
          <span className="text-4xl">🎁</span>
          <h3 className="mt-3 text-xl font-bold text-slate-800">Reservar Presente</h3>
          <p className="mt-2 text-sm text-slate-500">
            Você está escolhendo presentear com: <span className="font-semibold text-slate-700">{gift.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label htmlFor="guest-name" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Seu Nome Completo
            </label>
            <input
              type="text"
              id="guest-name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex: Maria Souza"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-pastel-yellow focus:outline-none focus:ring-2 focus:ring-pastel-yellow/20 transition-all text-slate-800"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <p className="mt-2 text-xs text-rose-500 font-medium">
              ⚠️ {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-pastel-green to-pastel-yellow py-3 text-sm font-semibold text-slate-800 hover:opacity-95 shadow-md shadow-pastel-yellow/10 active:scale-[0.98] transition-all disabled:opacity-55"
            >
              {loading ? 'Reservando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
