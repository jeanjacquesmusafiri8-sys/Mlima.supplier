import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(isAppleMobile && !isInstalled);
    setIsDismissed(sessionStorage.getItem('mlima-pwa-prompt-dismissed') === 'true');

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleAppInstalled = () => setInstallPrompt(null);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('mlima-pwa-prompt-dismissed', 'true');
    setIsDismissed(true);
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
  };

  if (isDismissed || (!installPrompt && !isIOS)) return null;

  return (
    <aside
      aria-label="Installer l’application MLIMA Supplier"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-[#0A2540] p-4 text-white shadow-xl sm:inset-x-5 sm:bottom-5"
    >
      <img
        src="/icons/mlima-192.png?v=2"
        alt=""
        className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white">Installer MLIMA Supplier</p>
        <p className="mt-1 text-xs leading-relaxed text-white/90">
          {isIOS && !installPrompt
            ? "Sur iPhone ou iPad : touchez Partager, puis « Sur l’écran d’accueil »."
            : "Ajoutez l’application à votre écran d’accueil pour retrouver le catalogue plus rapidement."}
        </p>
      </div>
      {installPrompt && (
        <button
          onClick={install}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#FFB800] px-3 py-2 text-xs font-bold text-[#0B0B0B]"
        >
          <Download className="h-4 w-4" /> Installer
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Fermer"
        className="shrink-0 rounded-lg p-1.5 text-white hover:text-[#FFB800]"
      >
        <X className="h-4 w-4" />
      </button>
    </aside>
  );
};
