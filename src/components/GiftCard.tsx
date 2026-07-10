import React from 'react';
import { Gift } from '@/types';

interface GiftCardProps {
  gift: Gift;
  onReserve: (gift: Gift) => void;
  isAdmin?: boolean;
  onRelease?: (giftId: string) => void;
  onDelete?: (giftId: string) => void;
}

export const GiftCard: React.FC<GiftCardProps> = ({
  gift,
  onReserve,
  isAdmin = false,
  onRelease,
  onDelete,
}) => {
  const { name, description, image_url, is_reserved, reserved_by } = gift;

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-all duration-300 ${is_reserved ? 'opacity-85 shadow-sm' : 'shadow-md hover:-translate-y-1 hover:shadow-xl hover:border-slate-200'}`}>
      
      {/* Imagem do presente */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Se o carregamento da imagem falhar, removemos para mostrar o placeholder
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : null}
        
        {/* Placeholder com gradiente de enxoval */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-tr from-sky-100 to-emerald-100">
          <span className="text-3xl">📦</span>
        </div>

        {/* Badge de Reservado */}
        {is_reserved && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold tracking-wider text-slate-800 shadow-lg">
              🎁 RESERVADO
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo descritivo */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-800">{name}</h3>
        <p className="mt-1 flex-1 text-sm text-slate-500 line-clamp-2">
          {description || "Sem observações específicas."}
        </p>

        {is_reserved && reserved_by && (
          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-100">
            Escolhido por: <span className="font-semibold text-slate-800">{reserved_by}</span>
          </div>
        )}

        {/* Ações */}
        <div className="mt-5">
          {isAdmin ? (
            <div className="flex gap-2">
              {is_reserved ? (
                <button
                  onClick={() => onRelease && onRelease(gift.id)}
                  className="flex-1 rounded-xl bg-amber-50 py-2.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200"
                >
                  Liberar
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 rounded-xl bg-slate-50 py-2.5 text-xs font-medium text-slate-400 cursor-not-allowed border border-slate-100"
                >
                  Disponível
                </button>
              )}
              <button
                onClick={() => onDelete && onDelete(gift.id)}
                className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100"
                title="Excluir presente"
              >
                🗑️
              </button>
            </div>
          ) : (
            <button
              onClick={() => onReserve(gift)}
              disabled={is_reserved}
              className={`w-full rounded-xl py-3 text-sm font-semibold tracking-wide shadow-sm transition-all duration-200 ${
                is_reserved
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-pastel-green to-pastel-yellow text-slate-800 hover:opacity-95 shadow-sm shadow-pastel-yellow/20 active:scale-[0.98]'
              }`}
            >
              {is_reserved ? 'Já Reservado' : 'Reservar Presente'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
