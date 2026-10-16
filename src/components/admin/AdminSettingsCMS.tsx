import React, { useState } from 'react';
import {
  Save,
  Check,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface AdminSettingsCMSProps {
  settings: SiteSettings;
  onSaveSettings: (newSettings: SiteSettings) => Promise<void>;
}

export const AdminSettingsCMS: React.FC<AdminSettingsCMSProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSaveSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer les paramètres.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Gestion du Contenu & Coordonnées Officielles (CMS)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Modifiez en temps réel les bannières, slogans, numéros de contact et immatriculations légales de MLIMA Supplier.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Paramètres enregistrés !</span>
          </div>
        )}
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Hero & Bannières */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="font-bold text-[#0A3B8C] uppercase tracking-wider text-xs flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Page d'Accueil & Slogans Vitrine</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Titre Principal (Hero H1)
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C] font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Sous-titre / Description de l'entreprise
              </label>
              <textarea
                rows={2}
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Texte de la Bannière d'Annonce Supérieure (Flash Info)
              </label>
              <input
                type="text"
                value={formData.bannerNotice}
                onChange={(e) => setFormData({ ...formData, bannerNotice: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Présentation Détaillée de la Société (Section À Propos & Footer)
              </label>
              <textarea
                rows={3}
                value={formData.aboutText}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Téléphones, WhatsApp & Emails */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="font-bold text-[#0A3B8C] uppercase tracking-wider text-xs flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Coordonnées Téléphoniques & Numérique</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ligne Téléphonique Principale
              </label>
              <input
                type="text"
                value={formData.phonePrimary}
                onChange={(e) => setFormData({ ...formData, phonePrimary: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Ligne Téléphonique Secondaire
              </label>
              <input
                type="text"
                value={formData.phoneSecondary}
                onChange={(e) => setFormData({ ...formData, phoneSecondary: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Numéro WhatsApp Business (Format international sans espace)
              </label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Courriel Officiel (Email)
              </label>
              <input
                type="email"
                value={formData.emailPrimary}
                onChange={(e) => setFormData({ ...formData, emailPrimary: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Mentions Légales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="font-bold text-[#0A3B8C] uppercase tracking-wider text-xs flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Identifiants Fiscaux (RDC)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Numéro RCCM
              </label>
              <input
                type="text"
                value={formData.rccm}
                onChange={(e) => setFormData({ ...formData, rccm: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Numéro Identification Nationale (ID NAT)
              </label>
              <input
                type="text"
                value={formData.idNat}
                onChange={(e) => setFormData({ ...formData, idNat: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Numéro Impôt (NIF)
              </label>
              <input
                type="text"
                value={formData.nif}
                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:outline-none focus:border-[#0A3B8C]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0A3B8C] hover:bg-[#082e6d] text-white font-bold py-3 px-8 rounded-xl shadow-md cursor-pointer flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? 'Enregistrement…' : 'Enregistrer toutes les modifications'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
