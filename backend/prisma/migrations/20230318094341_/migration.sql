/*
  Warnings:

  - You are about to drop the `Channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_bannedUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "_admins" DROP CONSTRAINT "_admins_A_fkey";

-- DropForeignKey
ALTER TABLE "_admins" DROP CONSTRAINT "_admins_B_fkey";

-- DropForeignKey
ALTER TABLE "_bannedUsers" DROP CONSTRAINT "_bannedUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_bannedUsers" DROP CONSTRAINT "_bannedUsers_B_fkey";

-- DropForeignKey
ALTER TABLE "_users" DROP CONSTRAINT "_users_A_fkey";

-- DropForeignKey
ALTER TABLE "_users" DROP CONSTRAINT "_users_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twofa_isEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twofa_secret" TEXT;

-- DropTable
DROP TABLE "Channel";

-- DropTable
DROP TABLE "_admins";

-- DropTable
DROP TABLE "_bannedUsers";

-- DropTable
DROP TABLE "_users";
