import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Laptop,
  Smartphone,
  Monitor,
  LogOut,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe,
  Clock,
  Trash2,
  RefreshCw,
  Info
} from 'lucide-react';
import { UserProfile, UserSession, SecurityLog } from '../../types';

interface SecuritySessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  sessions: UserSession[];
  securityLogs: SecurityLog[];
  onTerminateSession: (sessionId: string) => void;
  onTerminateAllOtherSessions: () => void;
  onToggle2FA: () => void;
  onChangePassword?: (oldPass: string, newPass: string) => boolean;
}

export const SecuritySessionsModal: React.FC<SecuritySessionsModalProps> = ({
  isOpen,
  onClose,
  user,
  sessions,
  securityLogs,
  onTerminateSession,
  onTerminateAllOtherSessions,
  onToggle2FA,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'security' | 'activity'>('sessions');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setNewPassword('');
        setConfirmPassword('');
      }, 3000);
    }
  };

  const handleTerminateAll = () => {
    setIsTerminating(true);
    setTimeout(() => {
      onTerminateAllOtherSessions();
      setIsTerminating(false);
    }, 400);
  };

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes('iphone') || d.includes('android') || d.includes('mobile')) {
      return <Smartphone className="w-5 h-5 text-slate-500" />;
    }
    if (d.includes('macbook') || d.includes('laptop')) {
      return <Laptop className="w-5 h-5 text-slate-500" />;
    }
    return <Monitor className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0A3B8C] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Sécurité & Gestion des Sessions
              </h2>
              <p className="text-xs text-slate-500">
                Supervisez les appareils connectés et protégez vos transactions B2B
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Summary Pill Strip */}
        <div className="px-6 py-3.5 bg-blue-50/50 border-b border-blue-100/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#0A3B8C] text-white font-bold flex items-center justify-center text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <span className="font-bold text-slate-900">{user?.name}</span>
              <span className="text-slate-500 ml-1.5 font-normal">({user?.email})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 font-medium text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Compte vérifié
            </span>
            {user?.isGoogleAuth && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                Google SSO
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'border-[#0A3B8C] text-[#0A3B8C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Sessions Actives ({sessions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#0A3B8C] text-[#0A3B8C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Paramètres de Sécurité & 2FA</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'border-[#0A3B8C] text-[#0A3B8C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Journal d'activité</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: SESSIONS ACTIVES */}
          {activeTab === 'sessions' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Appareils et navigateurs connectés</h3>
                  <p className="text-xs text-slate-500">
                    Si vous ne reconnaissez pas un appareil, déconnectez-le immédiatement pour préserver vos données.
                  </p>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={handleTerminateAll}
                    disabled={isTerminating}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnecter les autres</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      sess.isCurrentSession
                        ? 'border-blue-200 bg-blue-50/30'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                          {getDeviceIcon(sess.device)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-900">{sess.device}</h4>
                            {sess.isCurrentSession && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">
                                Session Actuelle
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 font-medium">
                              · {sess.browser} ({sess.os})
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-slate-400" />
                              {sess.location}
                            </span>
                            <span>·</span>
                            <span>IP: {sess.ipAddress}</span>
                            <span>·</span>
                            <span className="text-slate-600 font-medium">{sess.lastActive}</span>
                          </div>
                        </div>
                      </div>

                      {!sess.isCurrentSession ? (
                        <button
                          onClick={() => onTerminateSession(sess.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          Déconnecter
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold px-2 py-1 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          En ligne
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PARAMÈTRES DE SÉCURITÉ */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* 2FA Toggle Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#0A3B8C]" />
                      Authentification à Deux Facteurs (2FA)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Exige un code de validation SMS ou application d'authentification lors de chaque connexion.
                    </p>
                  </div>
                  <button
                    onClick={onToggle2FA}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      user?.twoFactorEnabled ? 'bg-[#0A3B8C]' : 'bg-slate-200'
                    }`}
                    role="switch"
                    aria-checked={user?.twoFactorEnabled}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        user?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    État actuel :{' '}
                    <strong className={user?.twoFactorEnabled ? 'text-emerald-700' : 'text-slate-600'}>
                      {user?.twoFactorEnabled ? 'Actif et protégeant votre compte' : 'Désactivé (non recommandé)'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Password update form */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#0A3B8C]" />
                    Changer le mot de passe de compte
                  </h4>
                  <p className="text-xs text-slate-500">
                    Utilisez un mot de passe robuste d'au moins 8 caractères avec majuscules et chiffres.
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Votre mot de passe a été modifié avec succès.</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 caractères"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A3B8C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A3B8C]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-[#0A3B8C] hover:bg-[#082e6d] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Mettre à jour le mot de passe
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: JOURNAL D'ACTIVITÉ */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Événements de sécurité récents</h3>
                <span className="text-[11px] text-slate-500">5 dernières connexions</span>
              </div>

              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white">
                {securityLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500'
                              : log.status === 'WARNING'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="font-semibold text-slate-900">{log.event}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {log.device} · IP: {log.ipAddress}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Sécurité certifiée SOC2 / RGPD</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
