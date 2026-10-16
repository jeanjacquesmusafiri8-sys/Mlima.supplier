import React, { useEffect, useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  FileCheck,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { QuoteItem, QuoteRequest, SiteSettings, UserProfile } from '../../types';

interface QuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: QuoteItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onSubmitQuote: (quote: Omit<QuoteRequest, 'id' | 'createdAt'>) => Promise<{
    quoteNumber: string;
    notifications: { email: 'sent' | 'failed' | 'not_configured' };
    whatsappUrl: string | null;
  }>;
  settings: SiteSettings;
  currentUser?: UserProfile | null;
  onOpenAuth?: (tab?: 'login' | 'register') => void;
  onOpenBillingProfile?: () => void;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitQuote,
  settings,
  currentUser = null,
  onOpenAuth,
  onOpenBillingProfile,
}) => {
  const [notes, setNotes] = useState('');
  const [submittedQuoteNumber, setSubmittedQuoteNumber] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{ email: 'sent' | 'failed' | 'not_configured' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNotes('');
    setSubmittedQuoteNumber(null);
    setWhatsappUrl(null);
    setNotificationStatus(null);
    setSubmitError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((acc, item) => {
    return acc + (item.priceUSD ? item.priceUSD * item.quantity : 0);
  }, 0);

  const totalEstimated = rawSubtotal;

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) return;

    if (!currentUser) {
      onClose();
      onOpenAuth?.('login');
      return;
    }

    if (!currentUser?.phone) {
      setSubmitError('Complétez votre téléphone dans le profil avant d’envoyer une demande de devis.');
      onOpenBillingProfile?.();
      return;
    }

    const newQuote: Omit<QuoteRequest, 'id' | 'createdAt'> = {
      quoteNumber: '',
      status: 'PENDING',
      clientName: currentUser.name,
      clientCompany: currentUser.companyName || undefined,
      clientPhone: currentUser.phone,
      clientEmail: currentUser.email,
      notes: notes || undefined,
      items,
      totalEstimated,
    };

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await onSubmitQuote(newQuote);
      setSubmittedQuoteNumber(result.quoteNumber);
      setNotificationStatus(result.notifications);
      setWhatsappUrl(result.whatsappUrl);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Impossible d’enregistrer le devis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Votre panier</span>
              <span className="bg-[#0A3B8C] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {totalItemsCount} article{totalItemsCount > 1 ? 's' : ''}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Commande sans paiement • MLIMA Supplier
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {submittedQuoteNumber ? (
            /* Success confirmation screen */
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 my-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Commande reçue
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Merci. L’équipe MLIMA Supplier va confirmer la disponibilité et les modalités de commande.
              </p>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 font-mono text-sm font-bold text-[#0A3B8C]">
                Numéro de référence : {submittedQuoteNumber}
              </div>

              {notificationStatus?.email !== 'sent' && (
                <p className="text-xs text-amber-800">La demande est enregistrée; l’envoi automatique de l’e-mail admin reste à configurer.</p>
              )}

              <div className="pt-2 flex flex-col gap-2">
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-[#0A2540] text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Envoyer aussi le récapitulatif par WhatsApp</span>
                </a>}

                <button
                  onClick={() => {
                    setSubmittedQuoteNumber(null);
                    setWhatsappUrl(null);
                    setNotificationStatus(null);
                    onClearCart();
                    onClose();
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline pt-2 cursor-pointer"
                >
                  Fermer et continuer vos achats
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <FileCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Votre panier est vide</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Parcourez le catalogue et ajoutez les produits souhaités au panier.
              </p>
              <button
                onClick={onClose}
                className="mt-2 bg-[#0A3B8C] text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer"
              >
                Explorer les produits
              </button>
            </div>
          ) : (
            /* Items list and order confirmation */
            <>
              {/* Items in Cart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Articles sélectionnés ({items.length})</span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-normal normal-case"
                  >
                    <Trash2 className="w-3 h-3" /> Vider
                  </button>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {items.map((item) => (
                    <div key={item.productId} className="p-3 flex items-center justify-between gap-3">
                      {item.image && <img src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                            {item.sku}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {item.name}
                        </h4>
                        <div className="text-[11px] text-slate-500">
                          {item.priceUSD ? (
                            <span>
                              ${item.priceUSD.toFixed(2)} × {item.quantity} ={' '}
                              <strong className="text-slate-800">
                                ${(item.priceUSD * item.quantity).toFixed(2)}
                              </strong>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium">Prix sur devis</span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotal Calculation */}
                {(
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Sous-total :</span>
                      <span>${rawSubtotal.toFixed(2)} USD</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between font-bold">
                      <span className="text-slate-800">Total estimé :</span>
                      <span className="text-base text-[#0A2540]">
                        {totalEstimated > 0 ? `$${totalEstimated.toFixed(2)} USD` : 'À confirmer'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

                {/* Billing identity comes from the saved account profile. */}
              <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3 pt-2 border-t border-slate-200">
                {!currentUser?.phone && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <p>Ajoutez votre téléphone au profil pour envoyer une demande de devis.</p>
                    <button type="button" onClick={onOpenBillingProfile} className="mt-2 font-bold underline">
                      Compléter mes coordonnées
                    </button>
                  </div>
                )}

                <label className="block text-xs font-semibold text-slate-600">
                  Précisions / Délais souhaités <span className="font-normal text-slate-400">(facultatif)</span>
                  <textarea
                    rows={2}
                    placeholder="Dimensions, quantités ou précisions sur les articles…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs focus:outline-none focus:border-[#0A3B8C]"
                  />
                </label>

                {/* Submit Action Buttons */}
                <div className="pt-4 space-y-2.5">
                  {submitError && <p role="alert" className="text-xs text-rose-700">{submitError}</p>}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0A2540] hover:bg-[#0A2540] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                      <span>{isSubmitting ? 'Enregistrement…' : 'Confirmer la commande'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Drawer Bottom Bar */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#0A3B8C] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            MLIMA Supplier • Bukavu
          </span>
          <span>RCCM CD/BKV/RCCM/21-A-00077</span>
        </div>
      </div>
    </div>
  );
};
