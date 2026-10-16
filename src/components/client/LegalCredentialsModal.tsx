import React from 'react';
import { X, ShieldCheck, CheckCircle2, FileText, Phone, Mail, Printer } from 'lucide-react';
import { SiteSettings } from '../../types';
import { Logo } from '../common/Logo';

interface LegalCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
}

export const LegalCredentialsModal: React.FC<LegalCredentialsModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#051b40] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Fiche d'Identification Officielle & Fiscale</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Card Top Presentation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Logo size="md" />
            <div className="text-right sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Statut Juridique :</span>
              <div className="font-bold text-slate-900 text-sm">Société Commerciale Agréée</div>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center sm:justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> En règle avec l'administration fiscale
              </span>
            </div>
          </div>

          {/* Legal Registry Numbers */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-[#0A3B8C] border-b pb-1">
              Immatriculations Légales en République Démocratique du Congo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Registre de Commerce</span>
                <span className="text-xs font-black text-[#0A3B8C] font-mono mt-1 block">
                  {settings.rccm}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Greffe de Bukavu</span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Identification Nationale</span>
                <span className="text-xs font-black text-amber-900 font-mono mt-1 block">
                  {settings.idNat}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Ministère de l'Économie</span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Numéro Impôt (NIF)</span>
                <span className="text-xs font-black text-emerald-900 font-mono mt-1 block">
                  {settings.nif}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Direction Générale des Impôts</span>
              </div>
            </div>
          </div>

          {/* Address & Contacts */}
          <div className="space-y-2 border-t pt-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-[#0A3B8C]">
              Contacts Officiels
            </h4>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0A3B8C] shrink-0" />
                <span><strong>Lignes directes :</strong> {settings.phonePrimary} / {settings.phoneSecondary}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0A3B8C] shrink-0" />
                <span><strong>Courriel commercial :</strong> {settings.emailPrimary}</span>
              </div>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="p-3 rounded-lg bg-slate-100 text-slate-600 text-[11px] leading-relaxed">
            <strong>Pour les ONG et Acheteurs B2B :</strong> MLIMA Supplier fournit sur simple demande le dossier d'agrément complet comprenant le certificat RCCM scanné, l'attestation fiscale de régularité DGI, et les références bancaires pour les virements en USD / Franc Congolais.
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer la fiche légale</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#0A3B8C] hover:bg-[#082e6d] text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
