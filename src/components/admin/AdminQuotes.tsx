import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Phone,
  Mail,
  Building,
  Printer,
  ChevronDown,
  Search,
  Filter
} from 'lucide-react';
import { QuoteRequest, QuoteStatus, SiteSettings } from '../../types';

interface AdminQuotesProps {
  quotes: QuoteRequest[];
  onUpdateQuoteStatus: (quoteId: string, status: QuoteStatus) => void;
  settings: SiteSettings;
}

export const AdminQuotes: React.FC<AdminQuotesProps> = ({
  quotes,
  onUpdateQuoteStatus,
  settings,
}) => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(
    quotes.length > 0 ? quotes[0].id : null
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const selectedQuote = quotes.find((q) => q.id === selectedQuoteId);

  useEffect(() => {
    if (!quotes.some((quote) => quote.id === selectedQuoteId)) {
      setSelectedQuoteId(quotes[0]?.id || null);
    }
  }, [quotes, selectedQuoteId]);

  const filteredQuotes = quotes.filter((q) => {
    const matchesFilter = filterStatus === 'all' || q.status === filterStatus;
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (q.clientCompany && q.clientCompany.toLowerCase().includes(search.toLowerCase())) ||
      q.clientPhone.includes(search);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> En attente
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" /> En traitement
          </span>
        );
      case 'SENT':
        return (
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Devis transmis
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Bon de commande validé
          </span>
        );
      case 'REJECTED':
        return (
          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" /> Sans suite
          </span>
        );
    }
  };

  const cleanClientPhone = (phone: string) => phone.replace(/[^0-9]/g, '');

  const generateWhatsAppReply = (q: QuoteRequest) => {
    const cleanPhone = cleanClientPhone(q.clientPhone);
    const message = encodeURIComponent(
      `Bonjour ${q.clientName},\n\nIci la direction commerciale de MLIMA Supplier concernant votre demande de devis N° *${q.quoteNumber}*.\n\nNous confirmons la disponibilité de vos articles. Souhaitez-vous recevoir notre proforma officielle par e-mail ou confirmer votre commande ?\n\nCordialement,\nÉquipe MLIMA Supplier\n+243 993 163 742`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Commandes clients
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consultez les commandes, confirmez leur traitement et contactez les clients.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer focus:outline-none"
          >
            <option value="all">Tous les statuts ({quotes.length})</option>
            <option value="PENDING">En attente</option>
            <option value="ACCEPTED">Confirmées</option>
            <option value="REJECTED">Annulées</option>
          </select>
        </div>
      </div>

      {/* Main Grid: List on Left, Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quotes List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[750px]">
          {/* Search bar inside list */}
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrer par nom, réf, téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white text-xs py-2 pl-8 pr-3 rounded-lg border border-slate-300 focus:outline-none focus:border-[#0A3B8C]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredQuotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aucune demande de devis ne correspond à ces critères.
              </div>
            ) : (
              filteredQuotes.map((q) => {
                const isSelected = selectedQuoteId === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuoteId(q.id)}
                    className={`p-4 transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-[#0A3B8C]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#0A3B8C]">
                        {q.quoteNumber}
                      </span>
                      {getStatusBadge(q.status)}
                    </div>

                    <div className="font-bold text-slate-900 mt-1 truncate">
                      {q.clientName}
                    </div>

                    {q.clientCompany && (
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 shrink-0" />
                        <span>{q.clientCompany}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <span>{q.items.length} produit{q.items.length > 1 ? 's' : ''}</span>
                      <span className="font-bold text-slate-800">
                        {q.totalEstimated > 0 ? `$${q.totalEstimated.toFixed(2)}` : 'Sur devis'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 h-[750px] overflow-y-auto space-y-6">
          {selectedQuote ? (
            <>
              {/* Top Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-black text-[#0A3B8C]">
                      {selectedQuote.quoteNumber}
                    </span>
                    {getStatusBadge(selectedQuote.status)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Reçu le {new Date(selectedQuote.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Statut :</span>
                  <select
                    value={selectedQuote.status}
                    onChange={(e) =>
                      onUpdateQuoteStatus(selectedQuote.id, e.target.value as QuoteStatus)
                    }
                    className="bg-slate-100 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
                  >
                    <option value="PENDING">En attente</option>
                    <option value="ACCEPTED">Confirmer</option>
                    <option value="REJECTED">Annuler</option>
                  </select>
                </div>
              </div>

              {/* Client Information Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-[#0A3B8C] uppercase text-[11px] tracking-wider">
                  Coordonnées du Demandeur
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nom Complet :</span>
                    <strong className="text-slate-900">{selectedQuote.clientName}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Organisation / Entreprise :</span>
                    <strong>{selectedQuote.clientCompany || 'Particulier'}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#0A3B8C]" />
                    <a
                      href={`tel:${selectedQuote.clientPhone}`}
                      className="hover:underline font-semibold"
                    >
                      {selectedQuote.clientPhone}
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#0A3B8C]" />
                    <a
                      href={`mailto:${selectedQuote.clientEmail}`}
                      className="hover:underline truncate"
                    >
                      {selectedQuote.clientEmail}
                    </a>
                  </div>

                </div>

                {selectedQuote.notes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                    <strong>Message client :</strong> {selectedQuote.notes}
                  </div>
                )}
              </div>

              {/* Items List Table */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Articles Demandés ({selectedQuote.items.length})</span>
                  {selectedQuote.totalEstimated > 0 && (
                    <span className="text-[#0A3B8C] font-black text-sm">
                      Total Estimé : ${selectedQuote.totalEstimated.toFixed(2)} USD
                    </span>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Produit</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3 text-center">Quantité</th>
                        <th className="py-2.5 px-3 text-right">Prix Unit.</th>
                        <th className="py-2.5 px-3 text-right">Sous-Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedQuote.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {it.image && <img src={it.image} alt="" className="mr-2 inline-block h-10 w-10 rounded-md object-cover align-middle" />}
                            {it.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-slate-600">
                            {it.sku}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {it.quantity} {it.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600">
                            {it.priceUSD ? `$${it.priceUSD.toFixed(2)}` : 'Sur devis'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {it.priceUSD
                              ? `$${(it.priceUSD * it.quantity).toFixed(2)}`
                              : 'Sur devis'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
                <a
                  href={generateWhatsAppReply(selectedQuote)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Répondre au Client par WhatsApp</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer Devis Proforma</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              Sélectionnez une demande dans la liste à gauche.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
