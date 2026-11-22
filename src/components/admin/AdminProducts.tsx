import React, { useEffect, useState } from 'react';
import { lazy, Suspense } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  FileSpreadsheet,
  SlidersHorizontal,
  Tag
} from 'lucide-react';
import { Product, Category, StockStatus } from '../../types';

const ProductImportModal = lazy(() =>
  import('./ProductImportModal').then((module) => ({
    default: module.ProductImportModal,
  })),
);

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  onOpenCreate: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onDeleteProducts: (productIds: string[]) => Promise<number>;
  onToggleFeatured: (productId: string) => void;
  onViewProductDetails: (product: Product) => void;
  onImportProducts: (products: Partial<Product>[]) => Promise<void>;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  onOpenCreate,
  onEditProduct,
  onDeleteProduct,
  onDeleteProducts,
  onToggleFeatured,
  onViewProductDetails,
  onImportProducts,
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;
    const matchesStock = filterStock === 'all' || p.stockStatus === filterStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  useEffect(() => {
    setSelectedIds((previous) =>
      new Set([...previous].filter((id) => products.some((product) => product.id === id))),
    );
  }, [products]);

  const visibleIds = filteredProducts.map((product) => product.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleSelection = (productId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleVisibleSelection = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const deleteSelected = async () => {
    const ids = [...selectedIds];
    if (
      ids.length === 0 ||
      !confirm(
        `Confirmez-vous la suppression de ${ids.length} produit${ids.length > 1 ? 's' : ''} ? Cette action est irréversible.`,
      )
    ) return;

    setIsDeleting(true);
    try {
      const deletedCount = await onDeleteProducts(ids);
      setSelectedIds(new Set());
      if (deletedCount === 0) {
        alert('Aucun produit n’a été supprimé.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Gestion du Catalogue Produits
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajoutez, éditez ou ajustez les stocks et les prix de vos équipements à Bukavu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importer des produits Excel</span>
          </button>
          <button
            onClick={onOpenCreate}
            className="flex items-center justify-center gap-1.5 bg-[#0A3B8C] hover:bg-[#082e6d] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Ajouter un Produit</span>
          </button>
        </div>
      </div>

      {isImportOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 text-sm font-semibold text-white">
              Chargement de l’importateur Excel…
            </div>
          }
        >
          <ProductImportModal
            isOpen={isImportOpen}
            categories={categories}
            products={products}
            onClose={() => setIsImportOpen(false)}
            onImportProducts={onImportProducts}
          />
        </Suspense>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Rechercher par nom, SKU ou mots-clés..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs py-2.5 pl-9 pr-3 rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:border-[#0A3B8C]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-48 bg-slate-50 text-slate-700 text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock filter */}
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="w-full md:w-40 bg-slate-50 text-slate-700 text-xs py-2.5 px-3 rounded-xl border border-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les stocks</option>
            <option value="IN_STOCK">En stock</option>
            <option value="LOW_STOCK">Stock faible</option>
            <option value="OUT_OF_STOCK">Rupture</option>
            <option value="ON_ORDER">Sur commande</option>
          </select>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3">
          <span className="text-xs font-bold text-rose-800">
            {selectedIds.size} produit{selectedIds.size > 1 ? 's sélectionnés' : ' sélectionné'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              disabled={isDeleting}
              className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white disabled:opacity-50"
            >
              Annuler la sélection
            </button>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Suppression…' : 'Supprimer la sélection'}
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px] font-bold">
              <tr>
                <th className="w-11 py-3 px-3 text-center">
                  <input
                    type="checkbox"
                    aria-label="Sélectionner tous les produits affichés"
                    checked={allVisibleSelected}
                    onChange={toggleVisibleSelection}
                    disabled={isDeleting || visibleIds.length === 0}
                    className="h-4 w-4 accent-rose-600"
                  />
                </th>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3">Prix Unit. (USD)</th>
                <th className="py-3 px-3">Stock & État</th>
                <th className="py-3 px-3 text-center">En Vedette</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun produit trouvé pour cette sélection.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const cat = categories.find((c) => c.id === prod.categoryId);
                  const img =
                    prod.images && prod.images.length > 0
                      ? prod.images[0]
                      : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Sélectionner ${prod.name}`}
                          checked={selectedIds.has(prod.id)}
                          onChange={() => toggleSelection(prod.id)}
                          disabled={isDeleting}
                          className="h-4 w-4 accent-rose-600"
                        />
                      </td>
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-11 h-11 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                                {prod.sku}
                              </span>
                              {prod.isNew && (
                                <span className="text-[9px] bg-blue-100 text-[#0A3B8C] font-bold px-1.5 rounded">
                                  Nouveau
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md mt-0.5">
                              {prod.name}
                            </div>
                            <div className="text-slate-400 text-[10px] truncate max-w-xs">
                              {prod.shortDesc}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700">
                          {cat?.name || 'Général'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 font-semibold">
                        {prod.priceUSD !== null && !prod.isQuoteOnly ? (
                          <span className="text-slate-900 font-bold">
                            ${prod.priceUSD.toFixed(2)}
                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                              /{prod.unit}
                            </span>
                          </span>
                        ) : (
                          <span className="text-amber-700 text-[11px] font-bold">
                            Sur devis
                          </span>
                        )}
                      </td>

                      {/* Stock Quantity & Status */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">
                            {prod.stockQuantity}
                          </span>
                          <span className="text-slate-400 text-[11px]">{prod.unit}</span>
                        </div>
                        <div className="mt-0.5">
                          {prod.stockStatus === 'IN_STOCK' ? (
                            <span className="text-[10px] text-emerald-700 font-bold">
                              ● En stock
                            </span>
                          ) : prod.stockStatus === 'LOW_STOCK' ? (
                            <span className="text-[10px] text-amber-700 font-bold">
                              ● Faible
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-700 font-bold">
                              ● Rupture
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Featured toggle */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onToggleFeatured(prod.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            prod.isFeatured
                              ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                              : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title="Basculer en vedette sur la page d'accueil"
                        >
                          <Sparkles className="w-4 h-4 fill-current" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewProductDetails(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0A3B8C] hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Voir la fiche client"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditProduct(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Confirmez-vous la suppression du produit ${prod.sku} - ${prod.name} ?`)) {
                                onDeleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            Affichage de <strong>{filteredProducts.length}</strong> sur {products.length} références au catalogue
          </span>
          <span className="font-semibold text-[#0A3B8C]">
            MLIMA Supplier Database
          </span>
        </div>
      </div>
    </div>
  );
};
