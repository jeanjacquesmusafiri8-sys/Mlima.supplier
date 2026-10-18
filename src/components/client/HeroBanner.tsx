import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  UserCheck,
  Lock,
  Building
} from 'lucide-react';
import { SiteSettings, UserProfile } from '../../types';

interface HeroBannerProps {
  settings: SiteSettings;
  onExploreCatalog: () => void;
  onOpenCart: () => void;
  onQuickRFQ?: (query: string) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  onExploreCatalog,
  onOpenCart,
  onQuickRFQ,
  currentUser = null,
  onOpenAuth,
}) => {
  const [rfqItem, setRfqItem] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rfqItem.trim()) {
      onExploreCatalog();
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white py-12 md:py-16">
      <img
        src="/mlima-company.jpg"
        alt="Un membre de l’équipe MLIMA Supplier accompagne un client dans son magasin."
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/45 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Main Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* {currentUser ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Bonjour {currentUser.name} · Compte {currentUser.companyName} (-15% Tarif Pro Actif)
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Plateforme B2B certifiée · Approvisionnement direct</span>
              </div>
            )} */}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Trouvez, comparez et commandez vos équipements en RDC.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              Appareils médicaux & de communication, pièces mécaniques, consommables d'hygiène et fournitures industrielles avec garantie de conformité.
            </p>

            {/* Alibaba-style Quick RFQ Box */}
            <form
              onSubmit={handleQuickSubmit}
              className="p-2 sm:p-2.5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-xl"
            >
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-4 h-4 text-slate-300 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Ex: Radio Motorola VHF, Pneus Toyota, Microscope..."
                  value={rfqItem}
                  onChange={(e) => setRfqItem(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-transparent text-white placeholder-slate-400 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#F3A712] hover:bg-[#d99209] text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md"
              >
                <span>Devis rapide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right Card: Alibaba B2B Direct RFQ & Highlights Widget */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                    RFQ
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Demande de devis groupée</h3>
                    <p className="text-[11px] text-slate-400">Pour entreprises, ONG et institutions</p>
                  </div>
                </div>
              </div>

              {/* 3 Steps in procurement */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-[#0A3B8C] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">Sélectionnez vos références</p>
                    <p className="text-[11px] text-slate-400">
                      Ajoutez les équipements souhaités à votre panier.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-[#0A3B8C] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">Obtenez une facture proforma officielle</p>
                    <p className="text-[11px] text-slate-400">
                      Calcul automatique des remises quantitatives et frais de transport.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-[#0A3B8C] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">Facturation proforma conforme</p>
                    <p className="text-[11px] text-slate-400">
                      Devis détaillés et disponibilité confirmée par notre équipe commerciale.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={onExploreCatalog}
                  className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors text-center cursor-pointer"
                >
                  Voir les 4 rayons
                </button>
                <button
                  onClick={onOpenCart}
                  className="flex-1 py-2.5 px-4 bg-[#0A3B8C] hover:bg-[#0c47a3] text-white text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer shadow-sm"
                >
                  Ouvrir mon panier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
