/*
  Warnings:

  - Added the required column `password` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `cards` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('CREDIT', 'DEBIT', 'BOTH');

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "type" "CardType" NOT NULL;
