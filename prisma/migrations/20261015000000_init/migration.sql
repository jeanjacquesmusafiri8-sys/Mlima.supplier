-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'ON_ORDER');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "phone" TEXT,
    "companyName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDesc" TEXT,
    "description" TEXT NOT NULL,
    "specifications" JSONB,
    "price" DECIMAL(10,2),
    "priceUSD" DECIMAL(10,2),
    "isQuoteOnly" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT NOT NULL DEFAULT 'Pièce',
    "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "stockStatus" "StockStatus" NOT NULL DEFAULT 'IN_STOCK',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_requests" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientCompany" TEXT,
    "clientAddress" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Bukavu',
    "notes" TEXT,
    "totalAmount" DECIMAL(12,2),
    "totalEstimated" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "userId" TEXT,
    "internalNotes" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" TEXT NOT NULL,
    "quoteRequestId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productSku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceUSD" DECIMAL(10,2),
    "notes" TEXT,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerCity" TEXT NOT NULL DEFAULT 'Bukavu',
    "notes" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "orderDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "companyName" TEXT NOT NULL DEFAULT 'MLIMA Supplier',
    "tagline" TEXT NOT NULL DEFAULT 'Votre partenaire d''approvisionnement fiable en RDC',
    "heroTitle" TEXT NOT NULL DEFAULT 'Fournisseur Général d''Équipements & Matériels de Qualité',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Appareils professionnels, pièces de rechange, hygiène, matériel de bureau et services pour entreprises, ONG et particuliers.',
    "emailPrimary" TEXT NOT NULL DEFAULT 'mlimasupplier@gmail.com',
    "phonePrimary" TEXT NOT NULL DEFAULT '+243 993 163 742',
    "phoneSecondary" TEXT NOT NULL DEFAULT '+243 848 474 077',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+243993163742',
    "addressStreet" TEXT NOT NULL DEFAULT 'Av. P E Lumumba, Q. Ndendere, Com. Ibanda',
    "addressCity" TEXT NOT NULL DEFAULT 'Bukavu',
    "addressCountry" TEXT NOT NULL DEFAULT 'République Démocratique du Congo',
    "rccm" TEXT NOT NULL DEFAULT 'CD/BKV/RCCM/21-A-00077',
    "idNat" TEXT NOT NULL DEFAULT '22-G4701-N77955M',
    "nif" TEXT NOT NULL DEFAULT 'A2604579Q',
    "bannerNotice" TEXT,
    "isMaintenance" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_categoryId_slug_key" ON "subcategories"("categoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_isFeatured_idx" ON "products"("isFeatured");

-- CreateIndex
CREATE INDEX "products_isPublic_idx" ON "products"("isPublic");

-- CreateIndex
CREATE INDEX "products_stockStatus_idx" ON "products"("stockStatus");

-- CreateIndex
CREATE UNIQUE INDEX "quote_requests_quoteNumber_key" ON "quote_requests"("quoteNumber");

-- CreateIndex
CREATE INDEX "quote_requests_status_idx" ON "quote_requests"("status");

-- CreateIndex
CREATE INDEX "quote_requests_userId_idx" ON "quote_requests"("userId");

-- CreateIndex
CREATE INDEX "cart_items_userId_idx" ON "cart_items"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_productId_key" ON "cart_items"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_userId_createdAt_idx" ON "orders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "quote_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
