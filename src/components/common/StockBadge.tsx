import React from 'react';
import { Lock, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { StockStatus } from '../../types';

interface StockBadgeProps {
  quantity: number;
  status?: StockStatus;
  isLoggedIn: boolean;
  onRequireAuth?: () => void;
  size?: 'sm' | 'md';
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  quantity,
  status = 'IN_STOCK',
  isLoggedIn,
  onRequireAuth,
  size = 'sm',
}) => {
  // ---------------------------------------------------------------------------
  // CAS 1 : Visiteur non connecté -> Quantité exacte MASQUÉE
  // ---------------------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <button
        onClick={onRequireAuth}
        className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium hover:text-slate-800 transition-colors cursor-pointer"
        title="Connectez-vous pour voir l'état exact des stocks"
      >
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // CAS 2 : Connecté -> Affichage précis du stock
  // ---------------------------------------------------------------------------
  if (status === 'OUT_OF_STOCK' || quantity <= 0) {
    return (
      <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 text-rose-500" />
        <span>Rupture de stock</span>
      </span>
    );
  }

  if (status === 'LOW_STOCK' || quantity < 5) {
    return (
      <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
        <Clock className="w-3 h-3 text-amber-500" />
        <span>Stock limité ({quantity} restants)</span>
      </span>
    );
  }

  return (
    <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>En stock ({quantity} unités)</span>
    </span>
  );
};
