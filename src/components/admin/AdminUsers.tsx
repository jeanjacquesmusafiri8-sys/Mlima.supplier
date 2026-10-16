import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  UserCheck,
  UserX,
  Mail,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminUsersProps {
  users: UserProfile[];
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'CLIENT'>('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const clientCount = users.filter((u) => u.role === 'CLIENT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Gestion des Utilisateurs & Rôles (Better Auth)
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0A3B8C] border border-blue-200">
              RBAC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contrôle d'accès strict par email et mot de passe. Les comptes ADMIN bénéficient des privilèges totaux de gestion.
          </p>
        </div>

        <p className="max-w-sm text-right text-xs text-slate-500">Les comptes se créent depuis l’inscription sécurisée. Le rôle administrateur est réservé au compte officiel MLIMA.</p>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Utilisateurs</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{users.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Base synchronisée Better Auth</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200/80 shadow-2xs bg-linear-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between text-[#0A3B8C] text-xs font-medium">
            <span>Administrateurs (ADMIN)</span>
            <ShieldAlert className="w-4 h-4 text-[#0A3B8C]" />
          </div>
          <div className="text-2xl font-black text-[#0A3B8C] mt-2">{adminCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Accès complet Back-Office</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs bg-linear-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Clients B2B Inscrits (CLIENT)</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{clientCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Accès prix négociés & devis</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, société..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A3B8C]/20 focus:border-[#0A3B8C]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === 'ADMIN'
                ? 'bg-[#0A3B8C] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter('CLIENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === 'CLIENT'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Clients ({clientCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Utilisateur / Nom</th>
                <th className="py-3 px-4">Email & Authentification</th>
                <th className="py-3 px-4">Organisation</th>
                <th className="py-3 px-4">Rôle Système</th>
                <th className="py-3 px-4">Vérification du compte</th>
                <th className="py-3 px-4 text-right">Accès</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun utilisateur ne correspond à votre filtre.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'ADMIN';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isAdmin ? 'bg-[#0A3B8C] text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{u.email}</span>
                        </div>
                        {u.emailVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Email vérifié
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.companyName || 'Compte Personnel'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-[#0A3B8C] border border-blue-200">
                            <Shield className="w-3.5 h-3.5" />
                            <span>ADMINISTRATEUR</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>CLIENT (B2B)</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-slate-600 font-medium">
                            {u.emailVerified ? 'E-mail vérifié' : 'E-mail non vérifié'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Inscrit : {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right text-[11px] text-slate-500">{isAdmin ? 'Compte officiel MLIMA' : 'Accès client'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
