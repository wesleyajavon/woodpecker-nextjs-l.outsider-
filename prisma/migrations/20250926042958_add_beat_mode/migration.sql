-- AlterTable
ALTER TABLE "Beat" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'majeur';

-- CreateIndex
CREATE INDEX "Beat_mode_idx" ON "Beat"("mode");
