/*
  Warnings:

  - You are about to drop the column `videoType` on the `Video` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PENDING', 'APPROVED', 'DELETED');

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "videoType",
ADD COLUMN     "isDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoStatus" "VideoStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "VideoType";
