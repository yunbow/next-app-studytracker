-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'private';

-- CreateIndex
CREATE INDEX "goals_visibility_idx" ON "goals"("visibility");
