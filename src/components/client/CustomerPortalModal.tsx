import React, { useState } from 'react';
import {
  X,
  User,
  ShoppingBag,
  Heart,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  Package,
  LogOut
} from 'lucide-react';
import { Customer, Order } from '../../types';

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: Customer;
  orders: Order[];
  onOpenWishlist: () => void;
  onLogout?: () => void;
}

export const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  orders,
  onOpenWishlist,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const customerOrders = orders.filter(
    (o) =>
      o.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase() ||
      o.customerName.toLowerCase() === currentCustomer.name.toLowerCase()
  );

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'PAID':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">● Payée</span>;
      case 'PROCESSING':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">● En préparation</span>;
      case 'CANCELLED':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">● Annulée</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">● En attente</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#051b40] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/50 border border-blue-400 text-amber-300 flex items-center justify-center font-bold">
              {currentCustomer.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>{currentCustomer.name}</span>
                {currentCustomer.role === 'VIP' && (
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                    COMPTE VIP
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-300">{currentCustomer.company || currentCustomer.email}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#0A3B8C] text-[#0A3B8C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mes Commandes ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#0A3B8C] text-[#0A3B8C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Facturation</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenWishlist();
            }}
            className="py-3 px-4 font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Heart className="w-4 h-4" />
            <span>Mes Favoris</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto text-xs text-slate-700 space-y-6">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {customerOrders.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700">Aucune commande enregistrée pour le moment.</p>
                </div>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#0A3B8C]">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Passée le {new Date(ord.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(ord.status)}
                        <span className="font-black text-slate-900 text-sm">
                          ${ord.total.toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="space-y-1.5 text-slate-600">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="truncate max-w-xs sm:max-w-md">
                            • {it.name} (×{it.quantity} {it.unit})
                          </span>
                          <span className="font-bold text-slate-800">
                            ${((it.priceUSD || 0) * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Timeline & Actions */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-400">
                        Traitement : <strong>{ord.status}</strong>
                      </span>
                      <button
                        onClick={() => window.print()}
                        className="text-[#0A3B8C] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Télécharger Facture Proforma</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-xl">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase text-[#0A3B8C]">
                  Informations de l'Acheteur
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nom :</span>
                    <strong className="text-slate-900">{currentCustomer.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Société / ONG :</span>
                    <strong className="text-slate-900">{currentCustomer.company || 'Particulier'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Téléphone :</span>
                    <strong>{currentCustomer.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email :</span>
                    <strong>{currentCustomer.email}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
                <span className="font-bold block">Conditions Partenaires & Crédit 30 Jours</span>
                <p className="text-[11px]">
                  En tant qu'institution agréée enregistrée auprès de MLIMA Supplier, vous bénéficiez du paiement sur facture à 30 jours et du suivi dédié.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-400">Espace Client Sécurisé • MLIMA Supplier</span>
          <button
            onClick={onClose}
            className="bg-[#0A3B8C] text-white font-bold py-2 px-5 rounded-lg cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
