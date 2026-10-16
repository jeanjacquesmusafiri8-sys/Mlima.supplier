import React from 'react';
import {
  ShoppingCart,
  MessageCircle,
  Eye,
  Heart,
} from 'lucide-react';
import { Product, Category } from '../../types';
import { PriceTag } from '../common/PriceTag';
import { StockBadge } from '../common/StockBadge';

interface ProductCardProps {
  product: Product;
  categories: Category[];
  whatsappNumber: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  categories,
  whatsappNumber,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onViewDetails,
  isLoggedIn = false,
  onRequireAuth,
}) => {
  const category = categories.find((c) => c.id === product.categoryId);
  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '');

  const mainImage = product.images?.[0] || '/Logo_officiel.png';

  const waProductMessage = encodeURIComponent(
    `Bonjour MLIMA Supplier, je souhaite un devis proforma pour le produit : ${product.name} (Réf: ${product.sku}).`
  );

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Product Image Frame */}
        <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            loading="lazy"
          />

          {/* Badges on Image */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            {product.isFeatured && (
              <span className="bg-[#0A2540] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                En vedette
              </span>
            )}
          </div>

          {/* Wishlist Button (Top Right) */}
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-xs transition-all cursor-pointer"
              aria-label="Ajouter aux favoris"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isWishlisted ? 'text-rose-500 fill-rose-500' : ''
                }`}
              />
            </button>
          )}

          {/* Quick Details Hover Overlay */}
          <button
            onClick={() => onViewDetails(product)}
            className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            <span className="bg-white text-slate-900 font-semibold text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 hover:bg-slate-50 transition-colors">
              <Eye className="w-3.5 h-3.5 text-[#0A2540]" />
              Fiche produit
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 space-y-2">
          {/* Category · SKU */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
            <span className="font-medium text-[#0A2540] truncate max-w-[120px]">
              {category?.name || 'Général'}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono text-[10px] text-slate-400">
              {product.sku}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-[#0A2540] cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Minimum de commande */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span className="text-slate-500 text-[10px]">
              Quantité minimale : {product.minOrderQuantity || 1} {product.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Order Actions - Strict Divergence */}
      <div className="p-3.5 pt-0 space-y-2.5">
        <div className="border-t border-slate-100 pt-2 flex items-start justify-between gap-2">
          <div className="flex-1">
            <PriceTag
              priceUSD={product.priceUSD}
              unit={product.unit}
              isLoggedIn={isLoggedIn}
              onRequireAuth={onRequireAuth}
              size="md"
            />
          </div>

          <div className="shrink-0 text-right">
            <StockBadge
              quantity={product.stockQuantity}
              status={product.stockStatus}
              isLoggedIn={isLoggedIn}
              onRequireAuth={onRequireAuth}
              size="sm"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {isLoggedIn ? (
            <button
              onClick={() => onAddToCart(product)}
              className="w-full py-2 px-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 bg-[#0A2540] hover:bg-[#0A2540] transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Ajouter au panier</span>
            </button>
          ) : (
            <button
              onClick={onRequireAuth}
              className="w-full py-2 px-1.5 rounded-xl text-white bg-[#0A2540] hover:bg-[#0A2540] font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Connectez-vous pour demander un devis"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Se connecter</span>
            </button>
          )}

          {isLoggedIn ? (
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${waProductMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <button
              onClick={onRequireAuth}
              className="w-full py-2 px-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-500 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contacter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
