/*
  Warnings:

  - You are about to drop the column `especialidad` on the `medicos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `medicos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `medicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `especialidad_id` to the `medicos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "medicos" DROP COLUMN "especialidad",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "especialidad_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "especialidades" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "especialidades_nombre_key" ON "especialidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_email_key" ON "medicos"("email");

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_especialidad_id_fkey" FOREIGN KEY ("especialidad_id") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
