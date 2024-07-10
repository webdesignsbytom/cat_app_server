-- DropIndex
DROP INDEX "Cat_profileId_key";

-- CreateIndex
CREATE INDEX "Cat_profileId_idx" ON "Cat"("profileId");
