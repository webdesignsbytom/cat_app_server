/*
  Warnings:

  - The primary key for the `Video` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_PlaylistVideos" DROP CONSTRAINT "_PlaylistVideos_B_fkey";

-- AlterTable
ALTER TABLE "Video" DROP CONSTRAINT "Video_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Video_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Video_id_seq";

-- AlterTable
ALTER TABLE "_PlaylistVideos" ALTER COLUMN "B" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "_PlaylistVideos" ADD CONSTRAINT "_PlaylistVideos_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
