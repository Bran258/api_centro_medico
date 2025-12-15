import prisma from "../prisma.js";

export const actualizarFotoPersona = async (req, res) => {
  const { id } = req.params;
  const { foto_url } = req.body;

  if (!foto_url) {
    return res.status(400).json({ message: "foto_url requerido" });
  }

  const persona = await prisma.personas.findUnique({
    where: { id: Number(id) },
  });

  if (!persona) {
    return res.status(404).json({ message: "Persona no encontrada" });
  }

  const actualizada = await prisma.personas.update({
    where: { id: Number(id) },
    data: { foto_url },
  });

  res.json({
    message: "Foto actualizada",
    persona: actualizada,
  });
};

