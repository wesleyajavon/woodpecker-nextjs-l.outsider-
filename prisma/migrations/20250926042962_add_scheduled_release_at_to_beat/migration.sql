-- AlterTable
ALTER TABLE "Beat" ADD COLUMN "scheduledReleaseAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Beat_scheduledReleaseAt_idx" ON "Beat"("scheduledReleaseAt");
