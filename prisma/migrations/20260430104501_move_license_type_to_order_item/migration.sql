-- Per-item license: move licenseType from MultiItemOrder to OrderItem.
-- Idempotent: OrderItem.licenseType may already exist (db push / partial deploy).

ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "licenseType" "LicenseType";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND c.relname = 'MultiItemOrder'
      AND a.attname = 'licenseType'
      AND NOT a.attisdropped
  ) THEN
    UPDATE "OrderItem" oi
    SET "licenseType" = mo."licenseType"
    FROM "MultiItemOrder" mo
    WHERE oi."orderId" = mo."id";
  END IF;
END $$;

UPDATE "OrderItem" SET "licenseType" = 'WAV_LEASE' WHERE "licenseType" IS NULL;

ALTER TABLE "OrderItem" ALTER COLUMN "licenseType" SET DEFAULT 'WAV_LEASE';
ALTER TABLE "OrderItem" ALTER COLUMN "licenseType" SET NOT NULL;

ALTER TABLE "MultiItemOrder" DROP COLUMN IF EXISTS "licenseType";
