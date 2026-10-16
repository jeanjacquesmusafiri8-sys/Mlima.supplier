import React, { useEffect, useState } from 'react';
import { Building, Phone, Save, User, X } from 'lucide-react';
import { UserProfile } from '../../types';

interface BillingProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onSaved: (profile: Partial<UserProfile>) => void;
}

export const BillingProfileModal: React.FC<BillingProfileModalProps> = ({ isOpen, user, onClose, onSaved }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(user.name);
    setPhone(user.phone || '');
    setCompanyName(user.companyName || '');
    setError('');
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, companyName }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Impossible d’enregistrer le profil.');
      onSaved(result);
      onClose();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Impossible d’enregistrer le profil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="billing-profile-title" className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 id="billing-profile-title" className="font-bold text-slate-900">Coordonnées de facturation</h2>
            <p className="mt-1 text-xs text-slate-500">Ces informations rempliront automatiquement vos prochaines commandes.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 text-slate-500 hover:bg-slate-200">
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 p-6">
          <label className="block text-xs font-semibold text-slate-700">
            Nom complet / Responsable <span className="text-red-700">*</span>
            <span className="relative mt-1 block">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-normal" />
            </span>
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Organisation / Entreprise / ONG <span className="font-normal text-slate-400">(facultatif)</span>
            <span className="relative mt-1 block">
              <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input maxLength={160} value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-normal" />
            </span>
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Téléphone (WhatsApp prioritaire) <span className="text-red-700">*</span>
            <span className="relative mt-1 block">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input required type="tel" minLength={5} maxLength={40} autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-normal" />
            </span>
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Adresse e-mail
            <input readOnly value={user.email} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-normal text-slate-600" />
          </label>

          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

          <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A2540] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? 'Enregistrement…' : 'Enregistrer mes coordonnées'}
          </button>
        </form>
      </section>
    </div>
  );
};