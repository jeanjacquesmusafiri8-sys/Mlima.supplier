import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Search,
  ShoppingCart,
  UserRound,
  X
} from 'lucide-react';
import { Category, Product, SiteSettings } from '../../types';
import { Footer } from '../common/Footer';

interface PublicVisitorHomeProps {
  categories: Category[];
  previewProducts: Product[];
  settings: SiteSettings;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export const PublicVisitorHome: React.FC<PublicVisitorHomeProps> = ({
  categories,
  previewProducts,
  settings,
  onOpenRegister,
  onOpenLogin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const activeProducts = previewProducts.filter((product) => product.isActive);
  const filteredProducts = activeProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || `${product.name} ${product.shortDesc} ${product.sku}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  const fallbackImage = '/Logo_officiel.png';
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallbackImage;
  };

  return (
    <div className="min-h-screen bg-white text-[#0A2540] flex flex-col font-sans antialiased selection:bg-[#FFB800] selection:text-[#0B0B0B]">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/Logo_officiel.png" alt="MLIMA Supplier" className="h-12 w-[68px] object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#accueil" className="hover:text-orange-600 transition-colors">
              Accueil
            </a>
            <a href="#rayons" className="hover:text-orange-600 transition-colors">
              Catégories
            </a>
            <a href="#catalogue" className="hover:text-orange-600 transition-colors">
              Produits
            </a>
            <a href="#catalogue" className="hover:text-orange-600 transition-colors">
              Catalogue
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="hidden lg:flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-500 focus-within:ring-2 focus-within:ring-orange-300">
              <Search className="w-4 h-4" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Rechercher" className="w-32 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-500" />
            </label>
            <button onClick={() => document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Rechercher dans le catalogue" className="lg:hidden p-2 text-slate-700 hover:text-orange-600">
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLogin}
              aria-label="Compte"
              className="p-2 text-slate-700 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <UserRound className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLogin}
              aria-label="Panier"
              className="p-2 text-slate-700 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenRegister}
              className="px-4 sm:px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-[#0B0B0B] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Inscription</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <section id="accueil" className="bg-[#0A2540] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-white/80 text-xs font-bold uppercase tracking-[0.18em] mb-5">Fournisseur général · Bukavu, RDC</p>
            <h1 className="text-4xl sm:text-6xl font-black leading-[1.02]">Fourniture d’équipements <span className="text-white">et matériels</span></h1>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/70">Appareils de communication, matériel hospitalier et électroménager, pièces de rechange, produits d’hygiène et services associés.</p>
            <button onClick={() => document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' })} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0A2540] transition-colors hover:bg-white/90">
              Voir le catalogue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Activités MLIMA Supplier" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold text-[#0A2540]">
          {['Appareils', 'Pièces de rechange', 'Hygiène', 'Autres services'].map((activity) => (
            <div key={activity} className="flex items-center justify-center gap-2"><span className="h-2 w-2 rounded-full bg-[#0A2540]" />{activity}</div>
          ))}
        </div>
      </section>

      <section id="rayons" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A2540]">
              Nos domaines
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Nos catégories
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-left"
              >
                <div className="space-y-3">
                  <div className="aspect-[16/9] overflow-hidden rounded-xl bg-slate-100">
                    <img src={cat.image || fallbackImage} alt="" onError={handleImageError} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {cat.description || 'Équipements et fournitures conformes aux normes professionnelles.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-orange-600">
                  <span>Voir le rayon</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Galerie publique : consultation libre, authentification au panier/commande. */}
      <section id="catalogue" className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Catalogue produits
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Tous les produits et leurs prix sont consultables librement.
              </p>
            </div>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500">
              <Search className="w-4 h-4" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Rechercher un produit" className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-500" />
            </label>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-2 bg-slate-950 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
            >
              <span>Effacer les filtres</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Galerie publique : les prix et descriptions sont consultables sans compte. */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="mb-5 break-inside-avoid bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                      alt={product.name}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {product.shortDesc || 'Équipement professionnel certifié conforme.'}
                    </p>
                    <p className="text-base font-black text-[#FFB800]">
                      {product.priceUSD === null ? 'Prix sur devis' : `$${product.priceUSD.toFixed(2)}`}
                      {product.priceUSD !== null && <span className="ml-1 text-[10px] font-medium text-slate-500">/ {product.unit}</span>}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                  <button
                    onClick={onOpenRegister}
                    className="py-2.5 px-2 rounded-xl bg-slate-950 hover:bg-orange-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Ajouter au panier
                  </button>
                  <button
                    onClick={onOpenRegister}
                    className="py-2.5 px-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Commander
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer settings={settings} onOpenAuth={onOpenLogin} />
    </div>
  );
};
