import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  FileSpreadsheet,
  Settings,
  Store,
  ShieldCheck,
  ChevronRight,
  Users
} from 'lucide-react';
import { Logo } from '../common/Logo';

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'quotes' | 'users' | 'cms';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingQuotesCount: number;
  onExitAdmin: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingQuotesCount,
  onExitAdmin,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'products',
      label: 'Gestion des Produits',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'categories',
      label: 'Catégories & Rayons',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'quotes',
      label: 'Commandes Clients',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: pendingQuotesCount > 0 ? pendingQuotesCount : undefined,
    },
    {
      id: 'users',
      label: 'Utilisateurs & Rôles',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'cms',
      label: 'Contenu & Coordonnées (CMS)',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#0A2540] text-white border-r border-white/10 flex flex-col justify-between shrink-0 min-h-screen">
      {/* Top Header */}
      <div>
        <div className="p-5 border-b border-slate-800">
          <Logo variant="white" size="sm" />
          <div className="mt-3 flex items-center justify-between bg-[#0A2540] p-2 rounded-lg border border-[#0A2540] text-xs">
            <span className="flex items-center gap-1.5 text-white font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Espace Back-Office</span>
            </span>
            <span className="bg-white text-[#0A2540] text-[10px] font-black px-1.5 py-0.2 rounded">
              ADMIN
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0A2540] shadow-sm font-bold border-l-4 border-[#FFB800]'
                    : 'text-white/90 hover:bg-white/10 hover:text-[#FFB800]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#0A2540]' : 'text-white/80'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="bg-white text-[#0A2540] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switch back to client store */}
      <div className="p-4 border-t border-slate-800 space-y-3">
          <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 px-3 rounded-xl border border-white/10 transition-colors cursor-pointer"
        >
          <Store className="w-4 h-4 text-white" />
          <span>Retour à la Boutique Client</span>
        </button>

          <div className="text-[10px] text-white/70 text-center">
          MLIMA Supplier Back-Office v1.0<br />
          Bukavu, RDC
        </div>
      </div>
    </aside>
  );
};
