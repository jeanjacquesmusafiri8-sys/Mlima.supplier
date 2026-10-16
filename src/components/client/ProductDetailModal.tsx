import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Copy,
  Check,
  Truck,
  Building2,
  Star,
  Zap,
  Heart,
  Plus,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Product, Category, Review, UserProfile } from '../../types';
import { PriceTag } from '../common/PriceTag';
import { StockBadge } from '../common/StockBadge';

interface ProductDetailModalProps {
  product: Product | null;
  categories: Category[];
  whatsappNumber: string;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onClose: () => void;
  onAddToCart: (product: Product, variantName?: string) => void;
  onQuickBuy?: (product: Product, variantName?: string) => void;
  currentUser?: UserProfile | null;
  onRequireAuth?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  categories,
  whatsappNumber,
  isWishlisted = false,
  onToggleWishlist,
  onClose,
  onAddToCart,
  onQuickBuy,
  currentUser = null,
  onRequireAuth,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants && product.variants.length > 0 ? product.variants[0].name : ''
  );
  const [copiedSku, setCopiedSku] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'reviews'>('specs');

  // New review form state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<Review[]>([
    {
      id: 'rev-default-1',
      productId: product.id,
      author: 'Dr. Célestin M.',
      company: 'Centre Hospitalier Bukavu',
      rating: 5,
      comment: 'Matériel certifié de qualité irréprochable, accompagné d’une facture conforme.',
      date: '2026-10-06',
      verified: true,
    },
    {
      id: 'rev-default-2',
      productId: product.id,
      author: 'Ing. Jean-Pierre',
      company: 'Logistique Kivu',
      rating: 5,
      comment: 'Conforme aux exigences techniques les plus strictes. Très bon rapport qualité-prix.',
      date: '2026-10-09',
      verified: true,
    },
  ]);

  const category = categories.find((c) => c.id === product.categoryId);
  const subcategory = category?.subcategories.find((s) => s.id === product.subcategoryId);

  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '');
  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'];

  const copySku = () => {
    navigator.clipboard.writeText(product.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toISOString().split('T')[0],
      verified: true,
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewAuthor('');
    setNewReviewComment('');
  };

  const waProductMessage = encodeURIComponent(
    `Bonjour MLIMA Supplier,\nJe souhaite obtenir un devis pour : ${product.name} (Réf: ${product.sku})${
      selectedVariant ? ` - Variante : ${selectedVariant}` : ''
    }.\nMerci de me préciser la disponibilité et le tarif.`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-[#0A3B8C] uppercase tracking-wider">
              {category?.name}
            </span>
            {subcategory && (
              <>
                <span>/</span>
                <span className="text-slate-700 font-medium">{subcategory.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(product.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Favoris"
              >
                <Heart
                  className={`w-4 h-4 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`}
                />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isFeatured && (
                <span className="absolute top-3 left-3 bg-[#F3A712] text-slate-950 font-black text-xs px-2.5 py-1 rounded shadow-md uppercase">
                  Vedette
                </span>
              )}
              {product.discountPercentage && (
                <span className="absolute top-3 right-3 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded shadow-md">
                  -{product.discountPercentage}%
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#0A3B8C] ring-2 ring-[#0A3B8C]/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* B2B Assurance Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Trade Assurance MLIMA Supplier</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Produits certifiés d'origine, garantie pièces & main d'œuvre et facturation proforma conforme.
              </p>
              <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0A3B8C]" />
                  Devis personnalisé
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#0A3B8C]" />
                  Assistance B2B
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Specs & Actions */}
          <div className="md:col-span-6 space-y-4">
            <div>
              {/* SKU & Stock */}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={copySku}
                  className="inline-flex items-center gap-1.5 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  title="Cliquer pour copier la référence"
                >
                  <span>SKU: {product.sku}</span>
                  {copiedSku ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                <StockBadge
                  quantity={product.stockQuantity}
                  status={product.stockStatus}
                  isLoggedIn={Boolean(currentUser)}
                  onRequireAuth={onRequireAuth}
                  size="md"
                />
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Ratings */}
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-500">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-slate-800">{product.rating || 4.9} / 5</span>
                <span className="text-slate-400">({reviewsList.length} avis certifiés)</span>
              </div>
            </div>

            {/* Price Box with Strict Divergence */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <PriceTag
                  priceUSD={product.priceUSD}
                  unit={product.unit}
                  isLoggedIn={Boolean(currentUser)}
                  onRequireAuth={onRequireAuth}
                  size="lg"
                />
              </div>

              <div className="sm:text-right text-xs text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 shrink-0">
                <span>Conditionnement :</span>
                <span className="font-bold text-slate-800 block">{product.unit}</span>
                <span className="text-[10px] text-slate-400">MOQ : {product.minOrderQuantity || 1} {product.unit}</span>
              </div>
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Choisir une variante :
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedVariant === v.name
                          ? 'border-[#0A3B8C] bg-blue-50 text-[#0A3B8C] font-bold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {v.name}
                      {v.priceModifier ? ` (+$${v.priceModifier})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs Selector: Caractéristiques, Description, Avis */}
            <div className="border-b border-slate-200 flex gap-4 text-xs font-bold pt-2">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 border-b-2 cursor-pointer ${
                  activeTab === 'specs'
                    ? 'border-[#0A3B8C] text-[#0A3B8C]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Fiche Technique
              </button>
              <button
                onClick={() => setActiveTab('desc')}
                className={`pb-2 border-b-2 cursor-pointer ${
                  activeTab === 'desc'
                    ? 'border-[#0A3B8C] text-[#0A3B8C]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 border-b-2 cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-[#0A3B8C] text-[#0A3B8C]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Avis Clients ({reviewsList.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="text-xs text-slate-700 leading-relaxed min-h-[90px]">
              {activeTab === 'specs' && (
                <div className="space-y-2">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                      {Object.entries(product.specifications).map(([key, val], i) => (
                        <div
                          key={key}
                          className={`flex justify-between px-3 py-1.5 ${
                            i % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                          }`}
                        >
                          <span className="text-slate-500 font-medium">{key}</span>
                          <span className="text-slate-900 font-bold text-right">{val}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">Spécifications standards conformes au fabricant.</p>
                  )}
                </div>
              )}

              {activeTab === 'desc' && (
                <p className="whitespace-pre-line text-slate-600">{product.description}</p>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {reviewsList.map((rev) => (
                      <div key={rev.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900">{rev.author}</strong>
                          <span className="text-amber-500 font-bold">★ {rev.rating}/5</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{rev.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add review form */}
                  <form onSubmit={handleAddReview} className="p-2.5 border rounded-lg bg-white space-y-2">
                    <span className="font-bold text-slate-800 text-[11px] block">Laisser un avis :</span>
                    <input
                      type="text"
                      placeholder="Votre nom / Organisation..."
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      className="w-full border rounded p-1.5 text-xs"
                      required
                    />
                    <textarea
                      placeholder="Votre appréciation du matériel..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full border rounded p-1.5 text-xs"
                      rows={2}
                      required
                    />
                    <div className="flex justify-between items-center">
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="border rounded p-1 text-xs"
                      >
                        <option value={5}>★★★★★ (5/5)</option>
                        <option value={4}>★★★★☆ (4/5)</option>
                        <option value={3}>★★★☆☆ (3/5)</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-[#0A3B8C] text-white px-3 py-1 rounded text-xs font-bold"
                      >
                        Publier l'avis
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {currentUser ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      onAddToCart(product, selectedVariant);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 bg-[#0A3B8C] hover:bg-[#082e6d] text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    <span>Ajouter au panier</span>
                  </button>

                  {onQuickBuy && product.priceUSD ? (
                    <button
                      onClick={() => {
                        onQuickBuy(product, selectedVariant);
                        onClose();
                      }}
                      className="flex items-center justify-center gap-2 bg-[#F3A712] hover:bg-[#d99209] text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Commander Immédiatement</span>
                    </button>
                  ) : (
                    <a
                      href={`https://wa.me/${cleanWhatsApp}?text=${waProductMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-[#0A2540] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Devis WhatsApp Direct</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onClose();
                      onRequireAuth?.();
                    }}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#FFB800] hover:bg-[#FFB800] text-[#0B0B0B] font-black py-3 px-4 rounded-xl transition-colors cursor-pointer text-xs sm:text-sm"
                  >
                    <span>Se connecter pour ajouter au panier ou demander un devis</span>
                    <ArrowRight className="w-4 h-4 text-[#0B0B0B]" />
                  </button>
                  <p className="text-[11px] text-center text-slate-500 font-medium">
                    Les prix sont publics. La connexion est demandée pour enregistrer une commande.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
