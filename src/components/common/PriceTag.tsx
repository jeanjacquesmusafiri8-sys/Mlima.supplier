import React from 'react';

interface PriceTagProps {
  priceUSD: number | null;
  unit?: string;
  isLoggedIn: boolean;
  onRequireAuth?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceTag: React.FC<PriceTagProps> = ({
  priceUSD,
  unit = 'Pièce',
  size = 'md',
}) => {
  if (priceUSD === null) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
        <span>Prix sur devis</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="space-y-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight">
            ${priceUSD.toFixed(2)}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-500">
            USD HT / {unit}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-base sm:text-lg font-black text-[#0A2540] tracking-tight">
          ${priceUSD.toFixed(2)}
        </span>
        <span className="text-[10px] text-slate-500">
          / {unit}
        </span>
      </div>
    </div>
  );
};
