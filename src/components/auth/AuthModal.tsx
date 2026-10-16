import React, { useEffect, useState } from 'react';
import { authClient } from '../../authClient';
import {
  X,
  Mail,
  Lock,
  Building,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Phone,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultTab?: 'login' | 'register';
  defaultEmail?: string;
  redirectNotice?: string | null;
}

const getFriendlyAuthError = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (/failed to fetch|networkerror|load failed/.test(message)) {
    return 'Le service de connexion est momentanément inaccessible. Réessayez dans quelques instants.';
  }
  if (/invalid_email_or_password|invalid email or password|invalid credentials|incorrect email or password|identifiants invalides|unauthorized|authentication failed|invalid password|user not found/.test(message)) {
    return 'Adresse e-mail ou mot de passe incorrect.';
  }
  if (/email_not_verified|email not verified/.test(message)) {
    return 'Confirmez votre adresse e-mail avec le lien reçu avant de vous connecter.';
  }
  if (/password_too_short|password too short/.test(message)) {
    return 'Le mot de passe doit contenir au moins 8 caractères.';
  }
  if (/user_already_exists|already exists|email already/.test(message)) {
    return 'Un compte existe déjà avec cette adresse e-mail. Essayez de vous connecter.';
  }
  if (/redirect_uri_mismatch|access_denied/.test(message)) {
    return 'La connexion Google est mal configurée. Contactez l’administrateur.';
  }
  return fallback;
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultTab = 'login',
  defaultEmail = '',
  redirectNotice = null,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Form states
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(defaultTab);
    setEmail(defaultEmail);
    setPassword('');
    setName('');
    setPhone('');
    setCompanyName('');
    setFeedback(null);
    setResetSent(false);
  }, [isOpen, defaultTab, defaultEmail]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin });
      if (result.error) throw new Error(result.error.message || 'Connexion Google impossible.');
    } catch (error) {
      setFeedback({ type: 'error', message: getFriendlyAuthError(error, 'Connexion Google impossible. Réessayez ou utilisez votre adresse e-mail.') });
      setIsLoading(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);
    try {
      if (activeTab === 'register') {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
          callbackURL: window.location.origin,
          fetchOptions: { body: { phone, companyName } },
        });
        if (result.error) throw new Error(result.error.message || 'Inscription impossible.');
        setFeedback({ type: 'success', message: 'Compte créé. Consultez votre e-mail pour vérifier votre adresse avant de vous connecter.' });
        setActiveTab('login');
        return;
      }

      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) throw new Error(result.error.message || 'Identifiants invalides.');
      const session = await authClient.getSession();
      const user = session.data?.user;
      if (!user) throw new Error('Aucune session active. Vérifiez votre adresse e-mail puis réessayez.');

      const profile = user as typeof user & { role?: string; phone?: string; companyName?: string };
      const loggedUser: UserProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.image || undefined,
        companyName: profile.companyName,
        phone: profile.phone,
        role: profile.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
        emailVerified: profile.emailVerified,
        isGoogleAuth: false,
      };
      onLoginSuccess(loggedUser);
      onClose();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getFriendlyAuthError(error, activeTab === 'register' ? 'Création du compte impossible. Vérifiez les informations saisies.' : 'Connexion impossible. Vérifiez vos informations puis réessayez.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: window.location.origin });
      if (result.error) throw new Error(result.error.message || 'Envoi du lien impossible.');
      setResetSent(true);
    } catch (error) {
      setFeedback({ type: 'error', message: getFriendlyAuthError(error, 'Envoi du lien impossible. Vérifiez votre adresse e-mail puis réessayez.') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Redirect Notice Banner (si redirection depuis middleware / route guard) */}
        {redirectNotice && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{redirectNotice}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-8 pt-7 pb-3 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#0A3B8C] mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {activeTab === 'login' && 'Connexion à votre espace MLIMA'}
            {activeTab === 'register' && 'Créer un compte professionnel'}
            {activeTab === 'forgot' && 'Réinitialiser votre mot de passe'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'login' &&
              'Choisissez Google, ou connectez-vous avec votre adresse e-mail et votre mot de passe.'}
            {activeTab === 'register' &&
              'Renseignez vos coordonnées. Un lien de vérification sera envoyé par e-mail.'}
            {activeTab === 'forgot' &&
              'Entrez votre adresse email pour recevoir un lien sécurisé.'}
          </p>

          {/* Tab Switcher */}
          {activeTab !== 'forgot' && (
            <div className="flex bg-slate-100 p-1 rounded-xl mt-4">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setFeedback(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setFeedback(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Créer un compte
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="px-8 pb-8 pt-2">
          {feedback && (
            <p role={feedback.type === 'error' ? 'alert' : 'status'} aria-live={feedback.type === 'error' ? 'assertive' : 'polite'} className={`mb-3 rounded-lg border px-3 py-2.5 text-xs leading-relaxed ${feedback.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
              {feedback.message}
            </p>
          )}
          {activeTab === 'forgot' ? (
            resetSent ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Lien envoyé avec succès</h3>
                <p className="text-xs text-slate-500">
                  Un email avec instructions a été envoyé à <strong>{email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setActiveTab('login');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4 mt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@entreprise.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0A3B8C]/20 focus:border-[#0A3B8C]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0A3B8C] hover:bg-[#082e6d] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Annuler et revenir
                </button>
              </form>
            )
          ) : (
            <>
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-200 hover:border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all font-semibold text-xs text-slate-700 shadow-2xs cursor-pointer group disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continuer avec Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  <span className="bg-white px-3">ou avec votre adresse e-mail</span>
                </div>
              </div>

              {/* Form Email / Password */}
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-3">
                {activeTab === 'register' && (
                  <>
                    <div>
                      <div>
                        <label htmlFor="auth-name" className="block text-[11px] font-medium text-slate-700 mb-1">
                          Nom complet
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            id="auth-name"
                            required
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nom complet"
                            aria-label="Nom complet"
                            className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0A3B8C]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="auth-company" className="block text-[11px] font-medium text-slate-700 mb-1">
                        Organisation / Entreprise / ONG <span className="font-normal text-slate-400">(facultatif)</span>
                      </label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          id="auth-company"
                          autoComplete="organization"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Organisation ou compte personnel"
                          className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0A3B8C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="auth-phone" className="block text-[11px] font-medium text-slate-700 mb-1">
                        Téléphone <span className="font-normal text-slate-400">(facultatif)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          id="auth-phone"
                          required
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+243 ..."
                          className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0A3B8C]"
                        />
                      </div>
                    </div>

                  </>
                )}

                <div>
                  <label htmlFor="auth-email" className="block text-[11px] font-medium text-slate-700 mb-1">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="auth-email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@entreprise.com"
                      className="w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0A3B8C] focus:border-[#0A3B8C]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="auth-password" className="block text-[11px] font-medium text-slate-700">
                      Mot de passe
                    </label>
                    {activeTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('forgot')}
                        className="text-[11px] text-[#0A3B8C] hover:underline cursor-pointer"
                      >
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="auth-password"
                      required
                      minLength={8}
                      autoComplete={activeTab === 'register' ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-8 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0A3B8C] focus:border-[#0A3B8C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0A3B8C] hover:bg-[#082e6d] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3"
                >
                  {isLoading ? (
                    'Vérification...'
                  ) : (
                    <>
                      <span>
                        {activeTab === 'login'
                          ? 'Se connecter'
                          : 'Créer mon compte professionnel'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Security note */}
             
            </>
          )}
        </div>
      </div>
    </div>
  );
};
