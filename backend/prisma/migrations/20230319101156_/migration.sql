/*
  Warnings:

  - You are about to drop the column `twofa_isEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twofa_secret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "twofa_isEnabled",
DROP COLUMN "twofa_secret",
ADD COLUMN     "twofactorIsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twofactorSecret" TEXT;
