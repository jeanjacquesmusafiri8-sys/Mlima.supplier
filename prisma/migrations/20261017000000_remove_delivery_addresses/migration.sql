ALTER TABLE "quote_requests" DROP COLUMN IF EXISTS "clientAddress";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "customerCity";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "addressStreet";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "addressCity";
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "addressCountry";
ALTER TABLE "user" DROP COLUMN IF EXISTS "city";