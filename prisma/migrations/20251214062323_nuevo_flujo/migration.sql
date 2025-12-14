/*
  Warnings:

  - The values [cliente] on the enum `rol_usuario` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `creada_por` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `hora` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `persona_id` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `persona_id` on the `contacto` table. All the data in the column will be lost.
  - The primary key for the `usuarios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `cliente_id` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_solicitada` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hora_solicitada` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cliente_id` to the `contacto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "rol_usuario_new" AS ENUM ('admin', 'asistente');
ALTER TABLE "usuarios" ALTER COLUMN "role" TYPE "rol_usuario_new" USING ("role"::text::"rol_usuario_new");
ALTER TYPE "rol_usuario" RENAME TO "rol_usuario_old";
ALTER TYPE "rol_usuario_new" RENAME TO "rol_usuario";
DROP TYPE "rol_usuario_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_medico_id_fkey";

-- DropForeignKey
ALTER TABLE "citas" DROP CONSTRAINT "citas_persona_id_fkey";

-- DropForeignKey
ALTER TABLE "contacto" DROP CONSTRAINT "contacto_persona_id_fkey";

-- AlterTable
ALTER TABLE "citas" DROP COLUMN "creada_por",
DROP COLUMN "fecha",
DROP COLUMN "hora",
DROP COLUMN "persona_id",
ADD COLUMN     "cliente_id" INTEGER NOT NULL,
ADD COLUMN     "fecha_confirmada" DATE,
ADD COLUMN     "fecha_solicitada" DATE NOT NULL,
ADD COLUMN     "hora_confirmada" TIME,
ADD COLUMN     "hora_solicitada" TIME NOT NULL,
ALTER COLUMN "medico_id" DROP NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'pendiente';

-- AlterTable
ALTER TABLE "contacto" DROP COLUMN "persona_id",
ADD COLUMN     "cliente_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "clientes_publicos" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_publicos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contacto" ADD CONSTRAINT "contacto_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes_publicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes_publicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
