/*
  Warnings:

  - You are about to drop the column `image` on the `Cat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cat" DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nickname" TEXT NOT NULL DEFAULT '';
