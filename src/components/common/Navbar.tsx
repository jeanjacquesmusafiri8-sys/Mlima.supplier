import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  LayoutDashboard,
  Store,
  User,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  Lock,
  ArrowRight,
  Shield,
  Layers,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import { Logo } from './Logo';
import { Category, SiteSettings, UserProfile } from '../../types';

interface NavbarProps {
  settings: SiteSettings;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: (tab?: 'login' | 'register') => void;
  onOpenBillingProfile: () => void;
  onOpenSecurityModal?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  isAdminMode,
  onToggleAdminMode,
  currentUser,
  onOpenAuthModal,
  onOpenBillingProfile,
  onOpenSecurityModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCatObj = categories.find((c) => c.id === selectedCategory);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Barre Principale */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-18 flex items-center justify-between gap-4 md:gap-6">
          {/* 1. Logo Officiel MLIMA Supplier */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onSelectCategory('all');
                if (isAdminMode) onToggleAdminMode();
              }}
              className="group flex items-center gap-2 cursor-pointer focus:outline-none text-left"
              aria-label="Accueil MLIMA Supplier"
            >
               <div className="flex items-center gap-3">
              <img
                src="/Logo_officiel.png"
                alt="MLIMA Supplier"
                className="h-12 w-[68px] object-contain"
              />
            </div>
            </button>
          </div>

          {/* 2. Barre de Recherche Centrale Professionnelle */}
          <div className="hidden md:flex flex-1 max-w-2xl items-center">
            <div className="relative w-full flex items-center bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white rounded-full border border-slate-200 focus-within:border-[#0A3B8C] focus-within:ring-4 focus-within:ring-[#0A3B8C]/10 transition-all shadow-xs overflow-hidden">
              {/* Sélecteur de rayon intégré */}
              <div className="relative shrink-0 border-r border-slate-200/80 bg-transparent" ref={catDropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#0A3B8C] cursor-pointer focus:outline-none"
                >
                  <span className="truncate max-w-[130px]">
                    {selectedCatObj ? selectedCatObj.name : 'Tous les rayons'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* Dropdown Catégories */}
                {categoriesDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        onSelectCategory('all');
                        setCategoriesDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-blue-50 text-[#0A3B8C]'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Tous les rayons</span>
                      {selectedCategory === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-[#0A3B8C]" />}
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setCategoriesDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-medium flex items-center justify-between cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-blue-50 text-[#0A3B8C] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {selectedCategory === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-[#0A3B8C]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Champ texte */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher pièces de rechange, groupes électrogènes, EPI, labo..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs py-2.5 pl-3.5 pr-8 focus:outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bouton recherche */}
              <button
                type="button"
                className="bg-[#0A3B8C] hover:bg-[#082e6d] text-white px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 rounded-r-full"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Rechercher</span>
              </button>
            </div>
          </div>

          {/* 3. Actions Utilisateur & Commandes (Côté Droit) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton Commande / Devis B2B */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-full bg-[#0A3B8C] hover:bg-[#082e6d] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer group"
              title="Consulter le panier"
            >
              <ShoppingCart className="w-4 h-4 text-[#F3A712] transition-transform group-hover:scale-110" />
              <span className="hidden sm:inline">Demande de Devis</span>
              {cartCount > 0 ? (
                <span className="bg-[#F3A712] text-slate-950 font-black text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                  {cartCount}
                </span>
              ) : (
                <span className="text-[10px] text-blue-200 hidden lg:inline">0 article</span>
              )}
            </button>

            {/* Profil Utilisateur / Menu Compte */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer text-left shadow-2xs"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-[#0A3B8C]/20"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#0A3B8C] to-[#082e6d] text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}

                  <div className="hidden lg:block text-left pr-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                        {currentUser.name}
                      </p>
                      {currentUser.role === 'ADMIN' && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                      {currentUser.companyName || (currentUser.role === 'ADMIN' ? 'Direction MLIMA' : 'Compte Pro')}
                    </p>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
                </button>

                {/* Dropdown Utilisateur Moderne */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 rounded-t-xl -mt-2.5 mb-1">
                      <div className="flex items-center gap-2.5">
                        {currentUser.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#0A3B8C] text-white font-bold text-sm flex items-center justify-center">
                            {currentUser.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              ● Rôle: {currentUser.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {/* Accès Admin si rôle ADMIN */}
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onToggleAdminMode();
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-amber-900 bg-amber-50/70 hover:bg-amber-100/70 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <LayoutDashboard className="w-4 h-4 text-amber-700" />
                            <span>{isAdminMode ? 'Revenir à la boutique' : 'Tableau de bord Admin (Back-Office)'}</span>
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded">
                            PRO
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenCart();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <ShoppingCart className="w-4 h-4 text-slate-500" />
                          <span>Mes demandes de devis</span>
                        </span>
                        {cartCount > 0 && (
                          <span className="text-[10px] bg-slate-900 text-white font-bold px-1.5 py-0.5 rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenBillingProfile();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2.5 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Profil de facturation</span>
                      </button>

                      {currentUser.role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenSecurityModal?.();
                            }}
                            className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center justify-between cursor-pointer"
                          >
                            <span className="flex items-center gap-2.5">
                              <Lock className="w-4 h-4 text-[#0A3B8C]" />
                              <span>Sécurité & Sessions actives</span>
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </button>

                        </>
                      )}
                    </div>

                    <div className="pt-1.5 mt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#0A3B8C] hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
                >
                  Connexion
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0A3B8C] hover:bg-[#082e6d] rounded-full shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Créer un compte</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Bouton Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Barre de Recherche Mobile */}
        <div className="pb-3 md:hidden">
          <div className="relative flex items-center bg-slate-100/90 rounded-full border border-slate-200">
            <input
              type="text"
              placeholder="Rechercher des produits ou références..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs py-2 pl-4 pr-8 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>
      </div>

      {/* 4. Barre Secondaire Épurée : Catégories & Garanties (Style Apple / Microsoft) */}
      <div className="hidden md:block border-t border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs py-2">
          {/* Pills Catégories avec scroll doux */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => onSelectCategory('all')}
              className={`px-3.5 py-1.5  font-semibold transition-all cursor-pointer text-xs ${
                selectedCategory === 'all'
                  ? 'text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous les produits
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer text-xs ${
                  selectedCategory === cat.id
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Menu Mobile Complet */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
              Rayons & Catégories
            </p>
            <button
              onClick={() => {
                onSelectCategory('all');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                selectedCategory === 'all' ? 'bg-[#0A3B8C] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Tous les rayons
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer ${
                  selectedCategory === cat.id ? 'bg-[#0A3B8C] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {currentUser ? (
              <>
                <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs">
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-slate-500 text-[11px]">{currentUser.email}</p>
                </div>
                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onToggleAdminMode();
                    }}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span>{isAdminMode ? 'Boutique' : 'Back-Office Admin'}</span>
                    <LayoutDashboard className="w-4 h-4 text-amber-700" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBillingProfile();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Profil de facturation</span>
                </button>
                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSecurityModal?.();
                    }}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-blue-50 text-[#0A3B8C] font-semibold text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Sécurité du compte</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                      Actif
                    </span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl text-rose-600 font-semibold text-xs flex items-center gap-2 cursor-pointer hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal('login');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs text-center cursor-pointer"
                >
                  Connexion
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal('register');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#0A3B8C] text-white font-bold text-xs text-center cursor-pointer shadow-xs"
                >
                  Créer un compte
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
