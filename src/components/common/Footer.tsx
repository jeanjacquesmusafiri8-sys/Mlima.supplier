import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  LayoutDashboard,
  Globe,
} from 'lucide-react';
import { Logo } from './Logo';
import { SiteSettings } from '../../types';

interface FooterProps {
  settings: SiteSettings;
  onOpenSecurity?: () => void;
  onToggleAdminMode?: () => void;
  onOpenAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenSecurity,
  onToggleAdminMode,
  onOpenAuth,
}) => {
  const [activeLegalDocument, setActiveLegalDocument] = useState<string | null>(null);
  const legalDocuments = [
    {
      title: 'Mentions légales',
      paragraphs: [
        `Éditeur : ${settings.companyName}.`,
        `Contact : ${settings.emailPrimary} · ${settings.phonePrimary}.`,
        `RCCM : ${settings.rccm || 'non renseigné'} · ID Nat : ${settings.idNat || 'non renseigné'} · NIF : ${settings.nif || 'non renseigné'}.`,
        'Développement de la plateforme : Jean-Jacques Musafiri.',
      ],
    },
    {
      title: 'Conditions générales de vente',
      paragraphs: [
        'Les informations et prix affichés dans le catalogue sont indicatifs. Une commande est confirmée après validation écrite du devis par MLIMA Supplier.',
        'Les prix sont exprimés dans la devise affichée. Les modalités de commande et de règlement sont confirmées avec le devis selon la disponibilité.',
        'Les conditions de garantie, de retour et de règlement applicables sont précisées sur le devis ou la facture correspondant à la commande.',
      ],
    },
    {
      title: 'Conditions générales d’utilisation',
      paragraphs: [
        'La consultation du catalogue est libre. Un compte est nécessaire pour utiliser les fonctions personnelles de panier et transmettre une demande de devis.',
        'Chaque utilisateur est responsable de la confidentialité de ses identifiants et de l’exactitude des informations transmises.',
        'L’utilisation du site ne doit pas perturber son fonctionnement ni porter atteinte aux droits de MLIMA Supplier ou de tiers.',
      ],
    },
    {
      title: 'Politique de confidentialité',
      paragraphs: [
        'Les données de compte et de contact (nom, adresse e-mail, téléphone et organisation), ainsi que les détails d’une demande de devis, servent à gérer l’accès et à répondre aux demandes commerciales.',
        'Les données sont accessibles aux personnes habilitées de MLIMA Supplier et conservées pendant la durée nécessaire au suivi du compte, des demandes et des obligations applicables.',
        `Pour toute question ou demande concernant vos données, contactez ${settings.emailPrimary}.` ,
      ],
    },
  ];
  const selectedLegalDocument = legalDocuments.find((document) => document.title === activeLegalDocument);

  return (
    <footer className="bg-[#0A2540] text-white border-t border-[#0B0B0B] mt-20 text-xs">
      {/* Main Content Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/Logo_officiel.png"
                alt="MLIMA Supplier"
                className="h-12 w-[68px] object-contain"
              />
            </div>
            <p className="text-white/90 max-w-sm leading-relaxed text-xs">
              Plateforme B2B d'approvisionnement pour entreprises, ONG et
              institutions en République Démocratique du Congo.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-white/90">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[11px] text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" />
                Fournisseur Certifié
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-[11px] text-white">
                <Lock className="w-3.5 h-3.5 text-[#FFB800]" />
                Sessions Sécurisées 2FA
              </span>
            </div>
          </div>

          {/* Col 2: Rayons */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Rayons
            </h4>
            <ul className="space-y-2 text-white/90">
              <li>
                <a
                  href="#catalogue-section"
                  className="hover:text-[#FFB800] transition-colors"
                >
                  Fourniture d'appareils
                </a>
              </li>
              <li>
                <a
                  href="#catalogue-section"
                  className="hover:text-[#FFB800] transition-colors"
                >
                  Pièces de rechange
                </a>
              </li>
              <li>
                <a
                  href="#catalogue-section"
                  className="hover:text-[#FFB800] transition-colors"
                >
                  Hygiène & Protection
                </a>
              </li>
              <li>
                <a
                  href="#catalogue-section"
                  className="hover:text-[#FFB800] transition-colors"
                >
                  Services & Équipements
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Services B2B */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Services B2B
            </h4>
            <ul className="space-y-2 text-white/90">
              <li>
                <span className="hover:text-[#FFB800] transition-colors cursor-pointer">
                  Demande de devis proforma
                </span>
              </li>
              <li>
                <span className="hover:text-[#FFB800] transition-colors cursor-pointer">
                  Prix dégressifs quantitatifs
                </span>
              </li>
              <li>
                <span className="hover:text-[#FFB800] transition-colors cursor-pointer">
                  Approvisionnement à Bukavu & dans le Grand Kivu
                </span>
              </li>
              <li>
                <span className="hover:text-[#FFB800] transition-colors cursor-pointer">
                  Garantie & SAV local
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Espace Pro & Sécurité */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Plateforme
            </h4>
            <ul className="space-y-2 text-white/90">
              {onOpenSecurity && (
                <li>
                  <button
                    onClick={onOpenSecurity}
                    className="hover:text-[#FFB800] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>Sécurité & Sessions</span>
                  </button>
                </li>
              )}
              {onOpenAuth && (
                <li>
                  <button
                    onClick={onOpenAuth}
                    className="hover:text-[#FFB800] transition-colors cursor-pointer"
                  >
                    Connexion Google / Email
                  </button>
                </li>
              )}
              {onToggleAdminMode && (
                <li>
                  <button
                    onClick={onToggleAdminMode}
                    className="hover:text-[#FFB800] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>Back-Office Administration</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Apple/Microsoft Style Clean Sub-footer */}
        <div className="mt-12 grid grid-cols-1 gap-4 border-t border-white/15 pt-6 text-[11px] text-white/85 lg:grid-cols-[1fr_auto] lg:items-center">
          <p>© 2026 MLIMA Supplier. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="flex items-center gap-1.5 text-white/90">
              <Globe className="w-3.5 h-3.5" />
              <span>Bukavu, Sud-Kivu · Devise : USD ($)</span>
            </span>
            {onOpenSecurity && (
              <button
                onClick={onOpenSecurity}
                className="hover:text-[#FFB800] transition-colors cursor-pointer"
              >
                Sécurité des données
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 border-t border-white/15 pt-5 text-[11px] xl:grid-cols-2 xl:items-start">
          <div className="flex flex-col gap-2 text-white/90">
            <span className="font-semibold text-white">Développement de la plateforme</span>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              className="text-white hover:text-[#FFB800]"
              href="mailto:jeanjacquesmusafiri8@gmail.com"
            >
              jeanjacquesmusafiri8@gmail.com
            </a>
            <a
              className="text-white hover:text-[#FFB800]"
              href="tel:+243832191419"
            >
              +243 832 191 419
            </a>
            </div>
          </div>
          <nav
            aria-label="Informations légales"
            className="grid grid-cols-1 gap-x-5 gap-y-2 text-white/90 sm:grid-cols-2"
          >
            {legalDocuments.map((document) => (
              <button
                key={document.title}
                onClick={() => setActiveLegalDocument(document.title)}
                className="text-left hover:text-[#FFB800]"
              >
                {document.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {selectedLegalDocument && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
          onClick={(event) =>
            event.target === event.currentTarget && setActiveLegalDocument(null)
          }
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-document-title"
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-[#0A2540] shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="legal-document-title" className="text-xl font-bold">
                {selectedLegalDocument.title}
              </h2>
              <button
                onClick={() => setActiveLegalDocument(null)}
                aria-label="Fermer"
                className="rounded-lg px-3 py-1 text-sm font-semibold text-[#0A2540] hover:bg-[#0A2540]/10"
              >
                Fermer
              </button>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-relaxed">
              {selectedLegalDocument.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        </div>
      )}
    </footer>
  );
};
