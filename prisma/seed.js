import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const especialidades = [
    { nombre: "Medicina General" },
    { nombre: "Pediatría" },
    { nombre: "Ginecología" },
    { nombre: "Cardiología" },
    { nombre: "Traumatología" },
  ];

  for (const e of especialidades) {
    await prisma.especialidades.upsert({
      where: { nombre: e.nombre },
      update: {},
      create: e,
    });
  }

  console.log("Especialidades cargadas");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
