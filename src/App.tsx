/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Category,
  Product,
  QuoteItem,
  QuoteRequest,
  QuoteStatus,
  SiteSettings,
  UserProfile,
  UserSession,
  SecurityLog
} from './types';
import {
  initialCategories,
  initialQuoteRequests,
  initialSiteSettings,
  initialRegisteredUsers,
  initialUserSessions,
  initialSecurityLogs,
} from "./data/initialData";
import { authClient } from './authClient';

// Common Components
import { Navbar } from './components/common/Navbar';
import { NotificationMenu } from "./components/common/NotificationMenu";
import { Footer } from './components/common/Footer';

// Client Components
import { HeroBanner } from './components/client/HeroBanner';
import { CategoryGrid } from './components/client/CategoryGrid';
import { ProductCard } from './components/client/ProductCard';
import { ProductDetailModal } from './components/client/ProductDetailModal';
import { QuoteDrawer } from './components/client/QuoteDrawer';
import { BillingProfileModal } from './components/client/BillingProfileModal';
import { PublicVisitorHome } from './components/visitor/PublicVisitorHome';

// Auth & Security Components
import { AuthModal } from './components/auth/AuthModal';
import { SecuritySessionsModal } from './components/auth/SecuritySessionsModal';

// Admin Components
import { AdminSidebar, AdminTab } from './components/admin/AdminSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminQuotes } from './components/admin/AdminQuotes';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminSettingsCMS } from './components/admin/AdminSettingsCMS';
import { ProductFormModal } from './components/admin/ProductFormModal';

// Icons
import {
  Sparkles,
  ArrowUpDown,
  Search,
  MessageCircle,
  ShieldCheck,
  Clock,
  Building,
  CheckCircle2,
  Lock,
  Menu,
  X,
} from "lucide-react";

interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string | null;
  totalAmount: number | string;
  createdAt: string;
  orderDetails: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    unit: string;
    unitPrice: number | null;
    image?: string | null;
  }>;
}

const mapOrderToQuote = (order: AdminOrderRow): QuoteRequest => ({
  id: order.id,
  quoteNumber: order.orderNumber,
  status: order.status === 'CONFIRMED' ? 'ACCEPTED' : order.status === 'CANCELLED' ? 'REJECTED' : 'PENDING',
  clientName: order.customerName,
  clientEmail: order.customerEmail,
  clientPhone: order.customerPhone,
  notes: order.notes || undefined,
  items: order.orderDetails.map((item) => ({
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    priceUSD: item.unitPrice,
    unit: item.unit,
    image: item.image || undefined,
  })),
  totalEstimated: Number(order.totalAmount),
  createdAt: order.createdAt,
});

export default function App() {
  // 1. Persistent State with localStorage
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('mlima_settings');
    return saved ? JSON.parse(saved) : initialSiteSettings;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mlima_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [products, setProducts] = useState<Product[]>([]);

  const [quotes, setQuotes] = useState<QuoteRequest[]>(() => {
    const saved = localStorage.getItem('mlima_quotes');
    return saved ? JSON.parse(saved) : initialQuoteRequests;
  });

  const [cartItems, setCartItems] = useState<QuoteItem[]>(() => {
    const saved = localStorage.getItem('mlima_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Authentication & Security State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    let active = true;
    authClient.getSession().then(({ data }) => {
      if (!active || !data?.user) return;
      const sessionUser = data.user as typeof data.user & { role?: string; phone?: string; companyName?: string };
      setCurrentUser({
        id: sessionUser.id,
        name: sessionUser.name,
        email: sessionUser.email,
        avatarUrl: sessionUser.image || undefined,
        companyName: sessionUser.companyName,
        phone: sessionUser.phone,
        role: sessionUser.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
        emailVerified: sessionUser.emailVerified,
      });
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const [sessions, setSessions] = useState<UserSession[]>(() => {
    const saved = localStorage.getItem('mlima_sessions');
    return saved ? JSON.parse(saved) : initialUserSessions;
  });

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const saved = localStorage.getItem('mlima_sec_logs');
    return saved ? JSON.parse(saved) : initialSecurityLogs;
  });

  // Registered Users (Better Auth RBAC Database)
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('mlima_users');
    return saved ? JSON.parse(saved) : initialRegisteredUsers;
  });

  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('mlima_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mlima_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mlima_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('mlima_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    fetch('/api/cart', { credentials: 'include' })
      .then(async (response) => response.ok ? response.json() : null)
      .then((rows) => {
        if (!active || !Array.isArray(rows)) return;
        setCartItems(rows.map((row: { productId: string; quantity: number; product: { id: string; sku: string; name: string; priceUSD: number | string | null; unit: string; images: string[] } }) => ({
          productId: row.productId,
          sku: row.product.sku,
          name: row.product.name,
          quantity: row.quantity,
          priceUSD: row.product.priceUSD === null ? null : Number(row.product.priceUSD),
          unit: row.product.unit,
          image: row.product.images?.[0],
        })));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [currentUser?.id]);

  useEffect(() => {
    let active = true;
    let loadingProducts = false;
    const refreshProducts = async () => {
      if (loadingProducts) return;
      loadingProducts = true;
      try {
        const productPath =
          isAdminMode && currentUser?.role === "ADMIN"
            ? "/api/admin/products"
            : "/api/products?limit=100";
        const response = await fetch(productPath, {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) return;
        const productRows: unknown = await response.json();
        if (active && Array.isArray(productRows)) {
          setProducts(
            productRows.map((row) => ({
              ...row,
              priceUSD: row.priceUSD === null ? null : Number(row.priceUSD),
              stockQuantity: Number(row.stockQuantity || 0),
            })) as Product[],
          );
        }
      } catch {
        // Preserve the last server-confirmed catalog during temporary network failures.
      } finally {
        loadingProducts = false;
      }
    };
    const readJson = async (path: string) => {
      const response = await fetch(path);
      if (!response.ok) return null;
      return response.json();
    };
    Promise.all([readJson("/api/categories"), readJson("/api/settings")])
      .then(([categoryRows, siteSettings]) => {
        if (!active) return;
        if (Array.isArray(categoryRows)) {
          setCategories(
            categoryRows.map((row) => ({
              ...row,
              description: row.description || "",
              icon: row.icon || "Layers",
              subcategories: row.subcategories || [],
            })) as Category[],
          );
        }
        if (siteSettings)
          setSettings((previous) => ({ ...previous, ...siteSettings }));
      })
      .catch(() => undefined);
    void refreshProducts();
    const refreshInterval = window.setInterval(
      () => void refreshProducts(),
      15_000,
    );
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshProducts();
    };
    window.addEventListener("focus", refreshProducts);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshProducts);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser?.role, isAdminMode]);

  useEffect(() => {
    if (currentUser?.role !== "ADMIN") return;
    let active = true;
    const readJson = async (path: string) => {
      const response = await fetch(path, { credentials: "include" });
      if (!response.ok) return null;
      return response.json();
    };
    Promise.all([
      readJson("/api/admin/products"),
      readJson("/api/admin/categories"),
      readJson("/api/admin/orders"),
      readJson("/api/admin/users"),
      readJson("/api/admin/settings"),
    ])
      .then(
        ([productRows, categoryRows, orderRows, userRows, siteSettings]) => {
          if (!active) return;
          if (Array.isArray(productRows)) {
            setProducts(
              productRows.map((row) => ({
                ...row,
                priceUSD: row.priceUSD === null ? null : Number(row.priceUSD),
              })) as Product[],
            );
          }
          if (Array.isArray(categoryRows)) {
            setCategories(
              categoryRows.map((row) => ({
                ...row,
                description: row.description || "",
                icon: row.icon || "Layers",
                subcategories: row.subcategories || [],
              })) as Category[],
            );
          }
          if (Array.isArray(orderRows))
            setQuotes(
              orderRows.map((row) => mapOrderToQuote(row as AdminOrderRow)),
            );
          if (Array.isArray(userRows))
            setUsers(
              userRows.map((row) => ({
                ...row,
                lastLogin: row.updatedAt,
                twoFactorEnabled: false,
              })) as UserProfile[],
            );
          if (siteSettings)
            setSettings((previous) => ({ ...previous, ...siteSettings }));
        },
      )
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    localStorage.setItem("mlima_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("mlima_sec_logs", JSON.stringify(securityLogs));
  }, [securityLogs]);

  useEffect(() => {
    localStorage.setItem("mlima_users", JSON.stringify(users));
  }, [users]);

  // 2. Navigation & UI Controls
  const [adminTab, setAdminTab] = useState<AdminTab>("dashboard");
  const [isAdminNavigationOpen, setIsAdminNavigationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "name"
  >("featured");

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">(
    "login",
  );
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isBillingProfileOpen, setIsBillingProfileOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] =
    useState<Product | null>(null);

  // Admin Product Form Modal
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 3. Cart & Quote Handlers
  const handleAddToCart = (product: Product, variantName?: string) => {
    const existingItem = cartItems.find(
      (item) => item.productId === product.id,
    );
    const nextQuantity = (existingItem?.quantity || 0) + 1;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            quantity: 1,
            priceUSD: product.priceUSD,
            unit: product.unit,
            image: product.images?.[0],
            notes: variantName ? `Variante: ${variantName}` : undefined,
          },
        ];
      }
    });
    if (currentUser) {
      void fetch("/api/cart", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: product.sku, quantity: nextQuantity }),
      }).catch(() => undefined);
    }
    showToast(`« ${product.name} » ajouté au panier.`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
    const item = cartItems.find((cartItem) => cartItem.productId === productId);
    if (currentUser && item) {
      void fetch("/api/cart", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: item.sku, quantity }),
      }).catch(() => undefined);
    }
  };

  const handleRemoveCartItem = (productId: string) => {
    const item = cartItems.find((cartItem) => cartItem.productId === productId);
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    if (currentUser && item) {
      void fetch(`/api/cart/${encodeURIComponent(item.sku)}`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() => undefined);
    }
    showToast("Article retiré du panier.");
  };

  const handleClearCart = () => {
    if (currentUser) {
      for (const item of cartItems) {
        void fetch(`/api/cart/${encodeURIComponent(item.sku)}`, {
          method: "DELETE",
          credentials: "include",
        }).catch(() => undefined);
      }
    }
    setCartItems([]);
    showToast("Panier vidé.");
  };

  const handleSubmitQuote = async (
    quoteData: Omit<QuoteRequest, "id" | "createdAt">,
  ) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        notes: quoteData.notes,
        items: quoteData.items.map(({ sku, quantity }) => ({
          sku,
          quantity,
        })),
      }),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Impossible d’enregistrer la commande.");
    return {
      quoteNumber: result.orderNumber,
      notifications: result.notifications,
      whatsappUrl: result.whatsappUrl as string | null,
    };
  };

  // 4. Admin CRUD Product Handlers
  const handleSaveProduct = async (productData: Partial<Product>) => {
    const payload = {
      sku: productData.sku,
      name: productData.name,
      slug: productData.slug,
      shortDesc: productData.shortDesc || "",
      description: productData.description || "",
      specifications: productData.specifications || {},
      priceUSD: productData.priceUSD ?? null,
      isQuoteOnly: productData.isQuoteOnly ?? false,
      unit: productData.unit || "Pièce",
      minOrderQuantity: productData.minOrderQuantity ?? 1,
      stockQuantity: productData.stockQuantity ?? 0,
      stockStatus: productData.stockStatus || "IN_STOCK",
      isFeatured: productData.isFeatured ?? false,
      isPublic: true,
      isActive: productData.isActive ?? true,
      isNew: productData.isNew ?? false,
      images: productData.images || [],
      categoryId: productData.categoryId,
      subcategoryId: productData.subcategoryId || null,
    };
    try {
      const isEditing = Boolean(productData.id);
      const response = await fetch(
        isEditing
          ? `/api/admin/products/${productData.id}`
          : "/api/admin/products",
        {
          method: isEditing ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Impossible d’enregistrer ce produit.");
      const savedProduct = {
        ...result,
        priceUSD: result.priceUSD === null ? null : Number(result.priceUSD),
      } as Product;
      setProducts((previous) =>
        isEditing
          ? previous.map((product) =>
              product.id === savedProduct.id
                ? { ...product, ...savedProduct }
                : product,
            )
          : [savedProduct, ...previous],
      );
      showToast(
        isEditing ? "Produit mis à jour." : "Produit ajouté au catalogue.",
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer ce produit.",
      );
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Impossible de supprimer ce produit.");
      }
      setProducts((previous) =>
        previous.filter((product) => product.id !== productId),
      );
      showToast("Produit supprimé du catalogue.");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer ce produit.",
      );
    }
  };

  const handleToggleFeatured = async (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !product.isFeatured }),
      });
      if (!response.ok)
        throw new Error("Impossible de modifier la mise en avant.");
      setProducts((previous) =>
        previous.map((item) =>
          item.id === productId
            ? { ...item, isFeatured: !item.isFeatured }
            : item,
        ),
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Impossible de modifier la mise en avant.",
      );
    }
  };

  // 5. Admin Category Handlers
  const handleAddCategory = async (
    categoryData: Omit<Category, "id" | "subcategories">,
  ) => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Impossible de créer la catégorie.");
      setCategories((previous) => [
        ...previous,
        {
          ...result,
          description: result.description || "",
          icon: result.icon || "Layers",
          subcategories: [],
        },
      ]);
      showToast(`Catégorie « ${categoryData.name} » créée.`);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Impossible de créer la catégorie.",
      );
    }
  };

  const handleAddSubcategory = async (categoryId: string, name: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    try {
      const response = await fetch(
        `/api/admin/categories/${categoryId}/subcategories`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Impossible de créer la sous-catégorie.",
        );
      setCategories((previous) =>
        previous.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                subcategories: [...category.subcategories, result],
              }
            : category,
        ),
      );
      showToast(`Sous-catégorie « ${name} » ajoutée.`);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Impossible de créer la sous-catégorie.",
      );
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          result.error || "Impossible de supprimer la catégorie.",
        );
      }
      setCategories((previous) =>
        previous.filter((category) => category.id !== categoryId),
      );
      showToast("Catégorie supprimée.");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer la catégorie.",
      );
    }
  };

  const handleDeleteSubcategory = async (
    categoryId: string,
    subcategoryId: string,
  ) => {
    try {
      const response = await fetch(
        `/api/admin/categories/${categoryId}/subcategories/${subcategoryId}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!response.ok)
        throw new Error("Impossible de supprimer la sous-catégorie.");
      setCategories((previous) =>
        previous.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                subcategories: category.subcategories.filter(
                  (subcategory) => subcategory.id !== subcategoryId,
                ),
              }
            : category,
        ),
      );
      showToast("Sous-catégorie supprimée.");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer la sous-catégorie.",
      );
    }
  };

  // 6. Admin Quote Handlers
  const handleUpdateQuoteStatus = async (
    quoteId: string,
    status: QuoteStatus,
  ) => {
    const orderStatus =
      status === "ACCEPTED"
        ? "CONFIRMED"
        : status === "REJECTED"
          ? "CANCELLED"
          : "PENDING";
    try {
      const response = await fetch(`/api/admin/orders/${quoteId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: orderStatus }),
      });
      if (!response.ok)
        throw new Error("Impossible de modifier le statut de la commande.");
      setQuotes((previous) =>
        previous.map((quote) =>
          quote.id === quoteId ? { ...quote, status } : quote,
        ),
      );
      showToast("Statut de commande enregistré.");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le statut.",
      );
    }
  };

  // 7. Authentication & Security Handlers (Better Auth & RBAC)
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setAuthModalNotice(null);

    // REDIRECTION AUTOMATIQUE SELON LE RÔLE (Exigence #3 & #4) :
    if (user.role === "ADMIN") {
      setIsAdminMode(true);
      setAdminTab("dashboard");
      showToast(
        `👑 Rôle ADMIN détecté : Redirection automatique vers le Back-Office.`,
      );
    } else {
      setIsAdminMode(false);
      showToast("Catalogue et panier disponibles.");
    }
  };

  const handleToggleAdminMode = () => {
    // Cas 1 : Utilisateur NON inscrit / NON connecté
    if (!currentUser) {
      setAuthModalNotice(
        "Authentification requise : Veuillez vous connecter avec un compte Administrateur MLIMA pour accéder au panneau d'administration.",
      );
      setAuthModalTab("login");
      setIsAuthModalOpen(true);
      showToast("Accès restreint : Connexion administrateur requise.");
      return;
    }

    // Cas 3 : Client connecté (role: 'CLIENT') tentant d'accéder à l'Admin
    if (currentUser.role !== "ADMIN") {
      showToast(
        "Accès 403 refusé : Votre compte CLIENT ne dispose pas des privilèges Administrateur.",
      );
      return;
    }

    // Autorisé : bascule vers le Back-Office
    setIsAdminMode((prev) => !prev);
  };

  const handleLogout = async () => {
    const userName = currentUser?.name;
    try {
      await authClient.signOut();
    } catch {
      showToast("La session serveur n’a pas pu être fermée.");
    }
    setCurrentUser(null);
    setIsAdminMode(false);
    setCartItems([]);
    showToast(
      `Déconnexion effectuée (${userName || "Utilisateur"}). Retour en mode public.`,
    );
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    const newLog: SecurityLog = {
      id: `sec-${Date.now()}`,
      event: "Session distante déconnectée manuellement",
      ipAddress: "197.157.218.42",
      device: "Panneau de sécurité",
      timestamp: new Date().toISOString(),
      status: "WARNING",
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
    showToast("Session distante fermée avec succès.");
  };

  const handleTerminateAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrentSession));
    const newLog: SecurityLog = {
      id: `sec-${Date.now()}`,
      event: "Déconnexion globale de toutes les sessions tierces",
      ipAddress: "197.157.218.42",
      device: "Panneau de sécurité",
      timestamp: new Date().toISOString(),
      status: "WARNING",
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
    showToast("Toutes les autres sessions ont été révoquées.");
  };

  const handleToggle2FA = () => {
    if (!currentUser) return;
    const newState = !currentUser.twoFactorEnabled;
    setCurrentUser((prev) =>
      prev ? { ...prev, twoFactorEnabled: newState } : null,
    );
    const newLog: SecurityLog = {
      id: `sec-${Date.now()}`,
      event: newState
        ? "Activation du 2FA (Double Authentification)"
        : "Désactivation du 2FA",
      ipAddress: "197.157.218.42",
      device: "Paramètres du compte",
      timestamp: new Date().toISOString(),
      status: newState ? "SUCCESS" : "ALERT",
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
    showToast(newState ? "2FA activé avec succès." : "2FA désactivé.");
  };

  // 8. Filtered Products Computation
  const filteredProducts = products.filter((product) => {
    if (!product.isActive || (!isAdminMode && product.isPublic === false))
      return false;
    if (selectedCategory !== "all" && product.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = product.name.toLowerCase().includes(q);
      const matchSku = product.sku.toLowerCase().includes(q);
      const matchDesc = product.shortDesc?.toLowerCase().includes(q) || false;
      const matchBrand = product.brand?.toLowerCase().includes(q) || false;
      return matchName || matchSku || matchDesc || matchBrand;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return (a.priceUSD ?? 999999) - (b.priceUSD ?? 999999);
      case "price-desc":
        return (b.priceUSD ?? 0) - (a.priceUSD ?? 0);
      case "name":
        return a.name.localeCompare(b.name);
      case "featured":
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  const featuredProducts = products.filter(
    (product) =>
      product.isFeatured &&
      product.isActive &&
      (isAdminMode || product.isPublic !== false),
  );
  const pendingQuotesCount = quotes.filter(
    (q) => q.status === "PENDING",
  ).length;
  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  // =========================================================================
  // CONDITION DE VISIBILITÉ DEMANDÉE :
  // Si le visiteur n'a pas encore créé de compte / n'est pas connecté :
  // Afficher la Page d'Accueil Spéciale Nouveaux Arrivants (PublicVisitorHome)
  // L'interface e-commerce complète est révélée UNIQUEMENT après inscription/connexion !
  // La barre de simulateur header est totalement supprimée.
  // =========================================================================
  if (!currentUser) {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page d'Accueil pour les Arrivants sans compte */}
        <PublicVisitorHome
          categories={categories}
          previewProducts={products.filter(
            (product) => product.isActive && product.isPublic !== false,
          )}
          settings={settings}
          onOpenRegister={() => {
            setAuthModalNotice(
              "Créez un compte pour ajouter des produits au panier et envoyer une demande de devis.",
            );
            setAuthModalTab("register");
            setIsAuthModalOpen(true);
          }}
          onOpenLogin={() => {
            setAuthModalNotice(null);
            setAuthModalTab("login");
            setIsAuthModalOpen(true);
          }}
        />

        {/* Modal d'Inscription & Connexion (Better Auth) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthModalNotice(null);
          }}
          onLoginSuccess={handleLoginSuccess}
          defaultTab={authModalTab}
          defaultEmail=""
          redirectNotice={authModalNotice}
        />
      </>
    );
  }

  // =========================================================================
  // INTERFACE COMPLÈTE : RÉVÉLÉE UNIQUEMENT APRÈS INSCRIPTION / CONNEXION
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50/75 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#0A3B8C] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-[#FFB800] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Minimalist Navbar (Apple / Microsoft Style) */}
      <Navbar
        settings={settings}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          if (catId !== "all") {
            const el = document.getElementById("catalogue-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdminMode={isAdminMode}
        onToggleAdminMode={handleToggleAdminMode}
        currentUser={currentUser}
        onOpenAuthModal={(tab) => {
          setAuthModalNotice(null);
          setAuthModalTab(tab || "login");
          setIsAuthModalOpen(true);
        }}
        onOpenBillingProfile={() => setIsBillingProfileOpen(true)}
        onOpenSecurityModal={
          currentUser?.role === "ADMIN"
            ? () => setIsSecurityModalOpen(true)
            : undefined
        }
        onLogout={handleLogout}
        notificationMenu={
          currentUser ? <NotificationMenu userId={currentUser.id} /> : undefined
        }
      />

      {/* ========================================================================= */}
      {/* VIEW 1: BACK-OFFICE / ADMIN PANEL                                        */}
      {/* ========================================================================= */}
      {isAdminMode ? (
        <div className="relative flex-1 min-w-0 md:flex md:flex-row">
          <div className="sticky top-[72px] z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              aria-label={
                isAdminNavigationOpen
                  ? "Fermer le menu d'administration"
                  : "Ouvrir le menu d'administration"
              }
              aria-controls="admin-navigation"
              aria-expanded={isAdminNavigationOpen}
              onClick={() => setIsAdminNavigationOpen((isOpen) => !isOpen)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-[#0A2540] hover:bg-slate-50"
            >
              {isAdminNavigationOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase text-slate-500">
                Espace administration
              </p>
              <p className="truncate text-sm font-bold text-[#0A2540]">
                {
                  {
                    dashboard: "Tableau de bord",
                    products: "Gestion des produits",
                    categories: "Catégories & rayons",
                    quotes: "Commandes clients",
                    users: "Utilisateurs & rôles",
                    cms: "Contenu & coordonnées",
                  }[adminTab]
                }
              </p>
            </div>
          </div>

          {isAdminNavigationOpen && (
            <button
              type="button"
              aria-label="Fermer le menu d'administration"
              onClick={() => setIsAdminNavigationOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
            />
          )}

          <AdminSidebar
            currentTab={adminTab}
            isOpen={isAdminNavigationOpen}
            onClose={() => setIsAdminNavigationOpen(false)}
            onSelectTab={(tab) => {
              setAdminTab(tab);
              setIsAdminNavigationOpen(false);
            }}
            pendingQuotesCount={pendingQuotesCount}
            onExitAdmin={() => {
              setIsAdminNavigationOpen(false);
              setIsAdminMode(false);
            }}
          />

          <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto w-full">
            {adminTab === "dashboard" && (
              <AdminDashboard
                products={products}
                categories={categories}
                quotes={quotes}
                onNavigateTab={(tab) => {
                  setAdminTab(tab);
                  setIsAdminNavigationOpen(false);
                }}
                onOpenNewProduct={() => {
                  setEditingProduct(null);
                  setIsProductFormOpen(true);
                }}
              />
            )}

            {adminTab === "products" && (
              <AdminProducts
                products={products}
                categories={categories}
                onOpenCreate={() => {
                  setEditingProduct(null);
                  setIsProductFormOpen(true);
                }}
                onEditProduct={(prod) => {
                  setEditingProduct(prod);
                  setIsProductFormOpen(true);
                }}
                onDeleteProduct={handleDeleteProduct}
                onToggleFeatured={handleToggleFeatured}
                onViewProductDetails={(prod) => setSelectedProductDetails(prod)}
              />
            )}

            {adminTab === "categories" && (
              <AdminCategories
                categories={categories}
                onAddCategory={handleAddCategory}
                onAddSubcategory={handleAddSubcategory}
                onDeleteCategory={handleDeleteCategory}
                onDeleteSubcategory={handleDeleteSubcategory}
              />
            )}

            {adminTab === "quotes" && (
              <AdminQuotes
                quotes={quotes}
                onUpdateQuoteStatus={handleUpdateQuoteStatus}
                settings={settings}
              />
            )}

            {adminTab === "users" && <AdminUsers users={users} />}

            {adminTab === "cms" && (
              <AdminSettingsCMS
                settings={settings}
                onSaveSettings={async (newSettings) => {
                  const response = await fetch("/api/admin/settings", {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newSettings),
                  });
                  const result = await response.json();
                  if (!response.ok)
                    throw new Error(
                      result.error ||
                        "Impossible d’enregistrer les paramètres.",
                    );
                  setSettings((previous) => ({ ...previous, ...result }));
                  showToast("Paramètres et coordonnées enregistrés.");
                }}
              />
            )}
          </main>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 2: FRONT-OFFICE / CLIENT STORE & CATALOGUE                          */
        /* ========================================================================= */
        <main className="flex-1">
          {/* Hero Banner with Quick RFQ */}
          {!currentUser && !searchQuery && selectedCategory === "all" && (
            <HeroBanner
              settings={settings}
              onExploreCatalog={() => {
                const catalogEl = document.getElementById("catalogue-section");
                catalogEl?.scrollIntoView({ behavior: "smooth" });
              }}
              onOpenCart={() => setIsCartOpen(true)}
              currentUser={currentUser}
              onOpenAuth={() => {
                setAuthModalTab("login");
                setIsAuthModalOpen(true);
              }}
            />
          )}

          {/* 4 Core Category Rayons Grid */}
          {!currentUser && !searchQuery && selectedCategory === "all" && (
            <CategoryGrid
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                const catalogEl = document.getElementById("catalogue-section");
                catalogEl?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          )}

          {/* Section: Featured B2B Recommendations */}
          {!currentUser &&
            !searchQuery &&
            selectedCategory === "all" &&
            featuredProducts.length > 0 && (
              <section className="bg-slate-100/60 border-y border-slate-200/60 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Produits en Vedette & Meilleures Ventes
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Équipements les plus demandés par les hôpitaux,
                        entreprises et ONG
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const catalogEl =
                          document.getElementById("catalogue-section");
                        catalogEl?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-xs font-semibold text-[#0A3B8C] hover:underline cursor-pointer"
                    >
                      Voir tout ({products.length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {featuredProducts.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        categories={categories}
                        whatsappNumber={settings.whatsappNumber}
                        onAddToCart={handleAddToCart}
                        onViewDetails={(prod) =>
                          setSelectedProductDetails(prod)
                        }
                        isLoggedIn={!!currentUser}
                        onRequireAuth={() => {
                          setAuthModalNotice(
                            "Veuillez vous connecter ou créer un compte pour voir les prix et demander un devis.",
                          );
                          setAuthModalTab("login");
                          setIsAuthModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

          {/* Section: Main Product Catalog with Alibaba-style Controls */}
          <section
            id="catalogue-section"
            className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
          >
            {/* Catalog Filter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Catalogue produits</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({sortedProducts.length} référence
                    {sortedProducts.length > 1 ? "s" : ""})
                  </span>
                </h2>
                {selectedCategory !== "all" && (
                  <p className="text-xs text-[#0A3B8C] font-medium mt-0.5">
                    Rayon sélectionné :{" "}
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </p>
                )}
              </div>

              {/* Sorting & Reset */}
              <div className="flex items-center gap-3 text-xs">
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                )}

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 text-[11px]">Trier :</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="featured">Pertinence & Vedettes</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name">Alphabétique (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Aucun produit ne correspond
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Modifiez votre recherche ou sélectionnez un autre rayon.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="bg-slate-900 text-white font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer"
                >
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
                {sortedProducts.map((product) => (
                  <div key={product.id} className="mb-5 break-inside-avoid">
                    <ProductCard
                      key={product.id}
                      product={product}
                      categories={categories}
                      whatsappNumber={settings.whatsappNumber}
                      onAddToCart={handleAddToCart}
                      onViewDetails={(prod) => setSelectedProductDetails(prod)}
                      isLoggedIn={!!currentUser}
                      onRequireAuth={() => {
                        setAuthModalNotice(
                          "Veuillez vous connecter ou créer un compte pour voir les prix et demander un devis.",
                        );
                        setAuthModalTab("login");
                        setIsAuthModalOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: Professional B2B Procurement Streamlined (Apple / Microsoft Cleanliness) */}
          {!currentUser && (
            <section className="bg-white border-t border-slate-200 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-2 max-w-xl">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400">
                      Approvisionnement B2B & Grands Comptes
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      Commandes institutionnelles et devis sur-mesure
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Factures proforma émises sous 2h avec conditions
                      tarifaires dégressives et acheminement sécurisé dans toute
                      la région des Grands Lacs.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          setAuthModalNotice(
                            "Connectez-vous pour préparer une demande de devis.",
                          );
                          setAuthModalTab("login");
                          setIsAuthModalOpen(true);
                          return;
                        }
                        setIsCartOpen(true);
                      }}
                      className="px-5 py-3 rounded-xl bg-[#F3A712] hover:bg-[#d99209] text-slate-950 font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      Préparer une demande de devis
                    </button>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}?text=Bonjour,%20je%20souhaite%20un%20devis%20institutionnel.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors text-center border border-white/20"
                    >
                      Contacter un conseiller
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      )}

      {/* Modern Minimalist Footer */}
      <Footer
        settings={settings}
        onOpenSecurity={
          currentUser?.role === "ADMIN"
            ? () => setIsSecurityModalOpen(true)
            : undefined
        }
        onToggleAdminMode={handleToggleAdminMode}
        onOpenAuth={() => {
          setAuthModalNotice(null);
          setAuthModalTab("login");
          setIsAuthModalOpen(true);
        }}
      />

      {/* ========================================================================= */}
      {/* MODALS & DRAWERS                                                          */}
      {/* ========================================================================= */}

      {/* 1. Auth Modal (Google & Email/Password avec Better Auth) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalNotice(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        defaultTab={authModalTab}
        defaultEmail={currentUser?.email || "contact@bkv-logistics.cd"}
        redirectNotice={authModalNotice}
      />

      {/* 2. Security & Active Sessions Modal */}
      <SecuritySessionsModal
        isOpen={isSecurityModalOpen && currentUser?.role === "ADMIN"}
        onClose={() => setIsSecurityModalOpen(false)}
        user={currentUser}
        sessions={sessions}
        securityLogs={securityLogs}
        onTerminateSession={handleTerminateSession}
        onTerminateAllOtherSessions={handleTerminateAllOtherSessions}
        onToggle2FA={handleToggle2FA}
      />

      {currentUser && (
        <BillingProfileModal
          isOpen={isBillingProfileOpen}
          user={currentUser}
          onClose={() => setIsBillingProfileOpen(false)}
          onSaved={(profile) =>
            setCurrentUser((current) =>
              current ? { ...current, ...profile } : current,
            )
          }
        />
      )}

      {/* 3. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetails}
        categories={categories}
        whatsappNumber={settings.whatsappNumber}
        onClose={() => setSelectedProductDetails(null)}
        onAddToCart={handleAddToCart}
        currentUser={currentUser}
        onRequireAuth={() => {
          setAuthModalNotice(
            "Veuillez vous connecter ou créer un compte pour voir les prix et demander un devis.",
          );
          setAuthModalTab("login");
          setIsAuthModalOpen(true);
        }}
      />

      {/* 4. Cart / Quote Drawer */}
      <QuoteDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onSubmitQuote={handleSubmitQuote}
        settings={settings}
        currentUser={currentUser}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab || "login");
          setIsAuthModalOpen(true);
        }}
        onOpenBillingProfile={() => setIsBillingProfileOpen(true)}
      />

      {/* 5. Product Form Modal (Admin Create / Edit) */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => {
          setIsProductFormOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
        categories={categories}
        onSaveProduct={handleSaveProduct}
      />
    </div>
  );
}
