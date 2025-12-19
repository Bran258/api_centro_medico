import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * CREAR CONTACTO – PÚBLICO
 * asunto: título del mensaje
 * mensaje: descripción / observaciones del asunto
 */
router.post("/", async (req, res) => {
  try {
    const { cliente_id, asunto, mensaje } = req.body;

    if (!cliente_id || !asunto || !mensaje) {
      return res.status(400).json({
        message: "cliente_id, asunto y mensaje son obligatorios",
      });
    }

    const contacto = await prisma.contacto.create({
      data: {
        cliente_id,
        asunto,
        mensaje,
      },
    });

    res.status(201).json({
      message: "Mensaje enviado correctamente",
      contacto,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al enviar mensaje" });
  }
});

/**
 * LISTAR CONTACTOS
 */
router.get("/", async (_req, res) => {
  try {
    const contactos = await prisma.contacto.findMany({
      orderBy: { created_at: "desc" },
      include: {
        cliente: {
          select: {
            nombres: true,
            apellidos: true,
            telefono: true,
            email: true,
          },
        },
      },
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

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const contacto = await prisma.contacto.findUnique({
      where: { id },
      include: {
        cliente: true,
      },
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
 * Solo se permite actualizar asunto o mensaje
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { asunto, mensaje } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    if (!asunto && !mensaje) {
      return res.status(400).json({
        message: "Debe enviar asunto o mensaje para actualizar",
      });
    }

    const contacto = await prisma.contacto.update({
      where: { id },
      data: {
        ...(asunto && { asunto }),
        ...(mensaje && { mensaje }),
      },
    });

    res.json({
      message: "Mensaje actualizado correctamente",
      contacto,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar mensaje" });
  }
});

/**
 * ELIMINAR CONTACTO
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
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
