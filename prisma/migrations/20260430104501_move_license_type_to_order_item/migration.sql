-- Per-item license: move licenseType from MultiItemOrder to OrderItem.
-- Safe when OrderItem is empty (defaults apply). Otherwise backfill from parent order.

ALTER TABLE "OrderItem" ADD COLUMN "licenseType" "LicenseType";

UPDATE "OrderItem" oi
SET "licenseType" = mo."licenseType"
FROM "MultiItemOrder" mo
WHERE oi."orderId" = mo."id";

UPDATE "OrderItem" SET "licenseType" = 'WAV_LEASE' WHERE "licenseType" IS NULL;

ALTER TABLE "OrderItem" ALTER COLUMN "licenseType" SET DEFAULT 'WAV_LEASE';
ALTER TABLE "OrderItem" ALTER COLUMN "licenseType" SET NOT NULL;

ALTER TABLE "MultiItemOrder" DROP COLUMN "licenseType";
