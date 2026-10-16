-- =============================================================================
-- SUPABASE POSTGRESQL SCHEMA & POLICIES - MLIMA SUPPLIER
-- =============================================================================
-- Exécutez ce script dans l'éditeur SQL de votre tableau de bord Supabase
-- =============================================================================

-- 1. Types ENUM
CREATE TYPE user_role AS ENUM ('CLIENT', 'ADMIN', 'MANAGER');
CREATE TYPE stock_status AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'ON_ORDER');
CREATE TYPE quote_status AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'ACCEPTED', 'REJECTED');

-- 2. Profils Utilisateurs (Liés à auth.users de Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  role user_role DEFAULT 'CLIENT'::user_role,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Catégories & Sous-catégories
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 4. Produits
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_desc TEXT,
  description TEXT NOT NULL,
  specifications JSONB DEFAULT '{}'::jsonb,
  price_usd NUMERIC(10, 2),
  is_quote_only BOOLEAN DEFAULT FALSE,
  unit TEXT DEFAULT 'Pièce',
  stock_quantity INT DEFAULT 0,
  stock_status stock_status DEFAULT 'IN_STOCK'::stock_status,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Demandes de Devis (Quotes)
CREATE TABLE public.quote_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT UNIQUE NOT NULL,
  status quote_status DEFAULT 'PENDING'::quote_status,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_company TEXT,
  notes TEXT,
  total_estimated NUMERIC(12, 2),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_request_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INT DEFAULT 1,
  unit_price_usd NUMERIC(10, 2),
  notes TEXT
);

-- 6. Paramètres du site (CMS)
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT DEFAULT 'MLIMA Supplier',
  tagline TEXT DEFAULT 'Votre partenaire d''approvisionnement fiable en RDC',
  hero_title TEXT DEFAULT 'Fournisseur Général d''Équipements & Matériels de Qualité',
  hero_subtitle TEXT DEFAULT 'Appareils professionnels, pièces de rechange, hygiène, matériel de bureau et services.',
  email_primary TEXT DEFAULT 'mlimasupplier@gmail.com',
  phone_primary TEXT DEFAULT '+243 993 163 742',
  phone_secondary TEXT DEFAULT '+243 848 474 077',
  whatsapp_number TEXT DEFAULT '+243993163742',
  rccm TEXT DEFAULT 'CD/BKV/RCCM/21-A-00077',
  id_nat TEXT DEFAULT '22-G4701-N77955M',
  nif TEXT DEFAULT 'A2604579Q',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer la configuration par défaut
INSERT INTO public.site_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- 7. Configuration RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique pour le catalogue
CREATE POLICY "Lecture publique des catégories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Lecture publique des produits" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Lecture publique des paramètres du site" ON public.site_settings FOR SELECT USING (true);

-- Politiques d'écriture pour les administrateurs
CREATE POLICY "Admin CRUD sur les produits" ON public.products FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Admin CRUD sur les catégories" ON public.categories FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Soumission publique de demandes de devis
CREATE POLICY "Tout le monde peut créer une demande de devis" ON public.quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Tout le monde peut créer des lignes de devis" ON public.quote_items FOR INSERT WITH CHECK (true);
