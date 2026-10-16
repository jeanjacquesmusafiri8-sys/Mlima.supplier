export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER';
export type QuoteStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'ACCEPTED' | 'REJECTED';
export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
export type PaymentMethod = 'M_PESA' | 'AIRTEL_MONEY' | 'BANK_TRANSFER' | 'CARD' | 'WHATSAPP';
export type AdminRole = 'SUPER_ADMIN' | 'CATALOG_MANAGER' | 'ORDER_MANAGER' | 'CONTENT_MANAGER';

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Modèle 15 HP", "Batterie 2200mAh", "Blanc", "Bidon 5L"
  priceModifier?: number;
  stock: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  company?: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verified: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  image?: string;
  subcategories: Subcategory[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  specifications?: Record<string, string>;
  priceUSD: number | null; // null = "Sur devis"
  originalPriceUSD?: number | null; // Pour afficher prix barré / réduction
  discountPercentage?: number;
  isQuoteOnly: boolean;
  unit: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  stockStatus: StockStatus;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  brand?: string;
  rating?: number;
  reviewsCount?: number;
  minOrderQuantity?: number; // Alibaba MOQ (e.g. 1 pièce, 5 unités)
  tieredPricing?: { minQty: number; priceUSD: number }[]; // Prix dégressif B2B
  supplierVerified?: boolean;
  responseRate?: string;
  images: string[];
  categoryId: string;
  subcategoryId?: string;
  variants?: ProductVariant[];
  tags?: string[];
  warranty?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  priceUSD: number | null;
  unit: string;
  image?: string;
  selectedVariant?: string;
}

export interface QuoteItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  priceUSD: number | null;
  unit: string;
  notes?: string;
  image?: string;
}

export interface QuoteRequest {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany?: string;
  notes?: string;
  items: QuoteItem[];
  totalEstimated: number;
  createdAt: string;
  internalNotes?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  items: CartItem[];
  notes?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  ordersCount: number;
  totalSpent: number;
  joinedAt: string;
  role: 'CLIENT' | 'VIP';
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // e.g., 10 for 10% or 15 for $15
  minSpend?: number;
  maxUsage?: number;
  usageCount: number;
  expiresAt: string;
  isActive: boolean;
  description?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  date: string;
  user: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
  type: 'PRODUCT' | 'ORDER' | 'STOCK' | 'SETTINGS';
}

export interface UserSession {
  id: string;
  device: string; // e.g. "MacBook Pro 16\"", "iPhone 15 Pro", "Windows PC"
  browser: string; // e.g. "Chrome 128.0", "Safari 17.4"
  os: string; // e.g. "macOS Sonoma", "iOS 18", "Windows 11"
  ipAddress: string;
  location: string; // e.g. "Kinshasa, RDC", "Bukavu, RDC", "Paris, France"
  lastActive: string;
  isCurrentSession: boolean;
  loginType: 'GOOGLE' | 'EMAIL_PASSWORD';
}

export interface SecurityLog {
  id: string;
  event: string;
  ipAddress: string;
  device: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  companyName?: string;
  phone?: string;
  role: 'ADMIN' | 'CLIENT' | 'BUYER' | 'SUPPLIER';
  emailVerified?: boolean;
  isGoogleAuth?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  lastLogin?: string;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  emailPrimary: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  rccm: string;
  idNat: string;
  nif: string;
  bannerNotice: string;
  aboutText: string;
  currency: string;
  enableMobileMoney: boolean;
  enableBankTransfer: boolean;
  enableCardPayment: boolean;
}
