-- AlterTable
-- Add licenseType to OrderItem (moved from MultiItemOrder per CHANGELOG v1.2.0)
ALTER TABLE "OrderItem" ADD COLUMN "licenseType" "LicenseType" NOT NULL DEFAULT 'WAV_LEASE';

-- Drop licenseType from MultiItemOrder (now managed per OrderItem)
ALTER TABLE "MultiItemOrder" DROP COLUMN IF EXISTS "licenseType";
