import React from 'react';
import {
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../../types';

interface UserRoleSimulatorBarProps {
  currentUser: UserProfile | null;
  onSetUser: (user: UserProfile | null) => void;
  mockClientUser: UserProfile;
  mockAdminUser: UserProfile;
}

export const UserRoleSimulatorBar: React.FC<UserRoleSimulatorBarProps> = ({
  currentUser,
  onSetUser,
  mockClientUser,
  mockAdminUser,
}) => {
  const isGuest = !currentUser;
  const isClient = currentUser && currentUser.role !== 'ADMIN';
  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  return (
    <aside
      aria-label="Simulateur d'expérience et de rôles Better Auth"
      className="bg-slate-900 text-white text-xs border-b border-slate-800 transition-all select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Statut actuel de la session Better Auth */}
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex h-2 w-2 relative shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isAdmin ? 'bg-blue-400' : isClient ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isAdmin ? 'bg-blue-500' : isClient ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>

          <span className="font-semibold text-slate-400">Rôle Actif (Better Auth) :</span>

          {isAdmin ? (
            <span className="font-bold text-blue-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
              <span>ADMINISTRATEUR (ADMIN)</span>
              <span className="text-slate-400 font-normal hidden sm:inline">
                ({currentUser.email})
              </span>
            </span>
          ) : isClient ? (
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CLIENT INSCRIT (CLIENT)</span>
              <span className="text-slate-400 font-normal hidden sm:inline">
                ({currentUser.companyName || currentUser.email})
              </span>
            </span>
          ) : (
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-amber-400" />
              <span>VISITEUR NON CONNECTÉ (PUBLIC)</span>
            </span>
          )}
        </div>

        {/* Diagnostic visibilité et restrictions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {isAdmin ? (
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-blue-300 bg-blue-950/80 border border-blue-800 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-blue-400" />
              <span>Accès Total Back-Office (/admin) + Prix débloqués</span>
            </span>
          ) : isClient ? (
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Prix visibles (-15%) · Stocks exacts · Admin bloqué (403)</span>
            </span>
          ) : (
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-md">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Prix & Stocks MASQUÉS · Devis redirigé vers /login</span>
            </span>
          )}

          {/* Boutons de bascule rapide des 3 profils */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onSetUser(null)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                isGuest
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tester le masquage strict pour visiteur non connecté"
            >
              1. Visiteur
            </button>

            <button
              onClick={() => onSetUser(mockClientUser)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                isClient
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tester avec le compte CLIENT (prix débloqués, admin 403)"
            >
              2. Client (B2B)
            </button>

            <button
              onClick={() => onSetUser(mockAdminUser)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-[#0A3B8C] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tester avec le compte ADMIN (accès total au panneau d'administration)"
            >
              3. Admin (Back-Office)
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
