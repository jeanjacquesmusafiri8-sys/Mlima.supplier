import React from 'react';
import {
  Package,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Product, Category, QuoteRequest } from '../../types';
import { AdminTab } from './AdminSidebar';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  quotes: QuoteRequest[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenNewProduct: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  quotes,
  onNavigateTab,
  onOpenNewProduct,
}) => {
  const inStockCount = products.filter((p) => p.stockStatus === 'IN_STOCK').length;
  const lowOrOutCount = products.filter(
    (p) => p.stockStatus === 'LOW_STOCK' || p.stockStatus === 'OUT_OF_STOCK'
  ).length;
  const featuredCount = products.filter((p) => p.isFeatured).length;

  const pendingQuotes = quotes.filter((q) => q.status === 'PENDING');
  const processedQuotes = quotes.filter((q) => q.status === 'PROCESSING' || q.status === 'SENT');

  const totalCatalogValue = products.reduce((acc, p) => {
    return acc + (p.priceUSD ? p.priceUSD * p.stockQuantity : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0A3B8C]">
            Panneau d'Administration
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Tableau de Bord - MLIMA Supplier
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervisez votre catalogue d'équipements, vos stocks et vos demandes de devis à Bukavu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-1.5 bg-[#0A3B8C] hover:bg-[#082e6d] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Nouveau Produit</span>
          </button>

          <button
            onClick={() => onNavigateTab('quotes')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0A3B8C]" />
            <span>Voir les Devis</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Produits</span>
            <div className="p-2 bg-blue-50 text-[#0A3B8C] rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{products.length}</div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {inStockCount} en stock
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-[11px] font-semibold text-[#0A3B8C] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            Gérer les références <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Pending Quotes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Devis en Attente</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{pendingQuotes.length}</div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              À traiter d'urgence
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('quotes')}
            className="text-[11px] font-semibold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            Consulter les demandes <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Alertes Stock</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{lowOrOutCount}</div>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              Faible ou Rupture
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            Réapprovisionner <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Estimated Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Valeur Stock Estimée</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">
              ${totalCatalogValue.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-[11px] font-semibold text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {categories.length} catégories actives
          </div>
        </div>
      </div>

      {/* Two columns: Recent Quotes & Categories Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Quotes Table */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#0A3B8C]" />
              <span>Dernières Demandes de Devis Reçues</span>
            </h3>
            <button
              onClick={() => onNavigateTab('quotes')}
              className="text-xs font-bold text-[#0A3B8C] hover:underline"
            >
              Voir tout ({quotes.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Réf Devis</th>
                  <th className="py-2.5 px-3">Client / Organisation</th>
                  <th className="py-2.5 px-3">Articles</th>
                  <th className="py-2.5 px-3">Total Est.</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.slice(0, 5).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#0A3B8C]">
                      {q.quoteNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{q.clientName}</div>
                      <div className="text-slate-400 text-[10px]">{q.clientCompany || q.clientEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {q.items.length} produit{q.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {q.totalEstimated > 0 ? `$${q.totalEstimated.toFixed(2)}` : 'Sur devis'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : q.status === 'PROCESSING'
                            ? 'bg-blue-100 text-blue-800'
                            : q.status === 'SENT'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {q.status === 'PENDING'
                          ? 'En attente'
                          : q.status === 'PROCESSING'
                          ? 'En cours'
                          : q.status === 'SENT'
                          ? 'Devis transmis'
                          : 'Validé'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigateTab('quotes')}
                        className="text-[11px] text-[#0A3B8C] hover:underline font-bold"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0A3B8C]" />
              <span>Répartition par Rayon</span>
            </h3>
            <button
              onClick={() => onNavigateTab('categories')}
              className="text-xs font-bold text-[#0A3B8C] hover:underline"
            >
              Gérer
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="truncate max-w-[190px]">{cat.name}</span>
                    <span className="bg-[#0A3B8C] text-white px-2 py-0.5 rounded-full text-[10px]">
                      {count} réf.
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {cat.subcategories.length} sous-catégories
                  </div>
                </div>
              );
            })}
          </div>

          {/* Featured items highlight */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{featuredCount} Produits Mis en Avant</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Ces produits apparaissent en premier sur la page d'accueil de la boutique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
