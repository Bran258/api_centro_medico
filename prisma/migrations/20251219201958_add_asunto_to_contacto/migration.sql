/*
  Warnings:

  - Added the required column `asunto` to the `contacto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contacto" ADD COLUMN     "asunto" TEXT NOT NULL;
