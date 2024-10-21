/*
  Warnings:

  - The values [COTD,GENERAL,THERAPY] on the enum `VideoType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoType_new" AS ENUM ('PENDING', 'APPROVED', 'DELETED');
ALTER TABLE "Video" ALTER COLUMN "videoType" DROP DEFAULT;
ALTER TABLE "Video" ALTER COLUMN "videoType" TYPE "VideoType_new" USING ("videoType"::text::"VideoType_new");
ALTER TYPE "VideoType" RENAME TO "VideoType_old";
ALTER TYPE "VideoType_new" RENAME TO "VideoType";
DROP TYPE "VideoType_old";
ALTER TABLE "Video" ALTER COLUMN "videoType" SET DEFAULT 'PENDING';
COMMIT;

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlaylistVideos" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlaylistVideos_AB_unique" ON "_PlaylistVideos"("A", "B");

-- CreateIndex
CREATE INDEX "_PlaylistVideos_B_index" ON "_PlaylistVideos"("B");

-- AddForeignKey
ALTER TABLE "_PlaylistVideos" ADD CONSTRAINT "_PlaylistVideos_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistVideos" ADD CONSTRAINT "_PlaylistVideos_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
