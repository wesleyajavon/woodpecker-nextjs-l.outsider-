-- AlterEnum
ALTER TYPE "LicenseType" RENAME TO "LicenseType_old";
CREATE TYPE "LicenseType" AS ENUM ('WAV_LEASE', 'TRACKOUT_LEASE', 'UNLIMITED_LEASE', 'EXCLUSIVE', 'CUSTOM');
ALTER TABLE "Order" ALTER COLUMN "licenseType" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "licenseType" TYPE "LicenseType" USING "licenseType"::text::"LicenseType";
ALTER TABLE "Order" ALTER COLUMN "licenseType" SET DEFAULT 'WAV_LEASE';
ALTER TABLE "MultiItemOrder" ALTER COLUMN "licenseType" DROP DEFAULT;
ALTER TABLE "MultiItemOrder" ALTER COLUMN "licenseType" TYPE "LicenseType" USING "licenseType"::text::"LicenseType";
ALTER TABLE "MultiItemOrder" ALTER COLUMN "licenseType" SET DEFAULT 'WAV_LEASE';
DROP TYPE "LicenseType_old";

-- AlterTable
ALTER TABLE "Beat" DROP COLUMN "price",
ADD COLUMN     "wavLeasePrice" DECIMAL(10,2) NOT NULL DEFAULT 19.99,
ADD COLUMN     "trackoutLeasePrice" DECIMAL(10,2) NOT NULL DEFAULT 39.99,
ADD COLUMN     "unlimitedLeasePrice" DECIMAL(10,2) NOT NULL DEFAULT 79.99;
