import React from 'react';
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProductIds: string[];
  products: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProductIds,
  products,
  onRemoveFromWishlist,
  onAddToCart,
  onViewProduct,
}) => {
  if (!isOpen) return null;

  const wishlistProducts = products.filter((p) => wishlistProductIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-base font-black text-slate-900">
              Mes Favoris ({wishlistProducts.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Votre liste d'envies est vide</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Cliquez sur le cœur d'un produit pour le conserver et le retrouver facilement.
              </p>
            </div>
          ) : (
            wishlistProducts.map((p) => {
              const img = p.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
              return (
                <div
                  key={p.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 hover:shadow-xs transition-shadow"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                      {p.sku}
                    </span>
                    <h4
                      onClick={() => {
                        onViewProduct(p);
                        onClose();
                      }}
                      className="text-xs font-bold text-slate-900 truncate mt-0.5 cursor-pointer hover:text-[#0A3B8C]"
                    >
                      {p.name}
                    </h4>
                    <div className="text-xs font-black text-[#0A3B8C] mt-0.5">
                      {p.priceUSD ? `$${p.priceUSD.toFixed(2)}` : 'Sur devis'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => onAddToCart(p)}
                      className="bg-[#0A3B8C] hover:bg-[#082e6d] text-white p-2 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      title="Ajouter au panier"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(p.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                      title="Supprimer des favoris"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {wishlistProducts.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500">{wishlistProducts.length} articles sauvegardés</span>
            <button
              onClick={() => {
                wishlistProducts.forEach((p) => onAddToCart(p));
                onClose();
              }}
              className="bg-[#0A3B8C] hover:bg-[#082e6d] text-white font-bold py-2 px-3.5 rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <span>Tout ajouter au panier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
