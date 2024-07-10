/*
  Warnings:

  - You are about to drop the column `species` on the `Cat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cat" DROP COLUMN "species",
ADD COLUMN     "breed" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "favouriteFood" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "image" TEXT NOT NULL DEFAULT '';
