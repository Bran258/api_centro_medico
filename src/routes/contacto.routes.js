import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * CREAR CONTACTO – PÚBLICO
 */
router.post("/", async (req, res) => {
  try {
    const contacto = await prisma.contacto.create({
      data: req.body,
    });

    res.status(201).json({
      message: "Mensaje enviado",
      contacto,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error al enviar mensaje" });
  }
});

/**
 * LISTAR CONTACTOS – (ADMIN / ASISTENTE si luego proteges)
 */
router.get("/", async (req, res) => {
  try {
    const contactos = await prisma.contacto.findMany({
      orderBy: { created_at: "desc" },
    });

    res.json(contactos);
  } catch (error) {
    res.status(500).json({ message: "Error al listar contactos" });
  }
});

/**
 * OBTENER CONTACTO POR ID
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const contacto = await prisma.contacto.findUnique({
      where: { id },
    });

    if (!contacto) {
      return res.status(404).json({ message: "Mensaje no encontrado" });
    }

    res.json(contacto);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener mensaje" });
  }
});

/**
 * ACTUALIZAR CONTACTO
 * (para marcar como leído, respondido, etc.)
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existe = await prisma.contacto.findUnique({
      where: { id },
    });

    if (!existe) {
      return res.status(404).json({ message: "Mensaje no encontrado" });
    }

    const contacto = await prisma.contacto.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: "Mensaje actualizado",
      contacto,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar mensaje" });
  }
});

/**
 * ELIMINAR CONTACTO
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existe = await prisma.contacto.findUnique({
      where: { id },
    });

    if (!existe) {
      return res.status(404).json({ message: "Mensaje no encontrado" });
    }

    await prisma.contacto.delete({
      where: { id },
    });

    res.json({ message: "Mensaje eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar mensaje" });
  }
});

export default router;
