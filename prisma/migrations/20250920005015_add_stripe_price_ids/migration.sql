-- AlterTable
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "stripeWavPriceId" TEXT;
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "stripeTrackoutPriceId" TEXT;
ALTER TABLE "Beat" ADD COLUMN IF NOT EXISTS "stripeUnlimitedPriceId" TEXT;
