import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { actualizarFotoPersona } from "../controllers/personas.controller.js";

const router = Router();

/**
 * CREAR PERSONA (ADMIN)
 */
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { dni } = req.body;

      if (!dni) {
        return res.status(400).json({ message: "DNI es obligatorio" });
      }

      const existente = await prisma.personas.findUnique({
        where: { dni },
      });

      if (existente) {
        return res.status(200).json({
          message: "Persona ya existe",
          persona: existente,
        });
      }

      const persona = await prisma.personas.create({
        data: req.body,
      });

      res.status(201).json({
        message: "Persona creada",
        persona,
      });
    } catch (error) {
      res.status(500).json({ message: "Error al crear persona" });
    }
  }
);

/**
 * LISTAR PERSONAS (ADMIN)
 */
router.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const personas = await prisma.personas.findMany({
      orderBy: { id: "desc" },
    });
    res.json(personas);
  }
);

router.put(
  "/me",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const usuario = await prisma.usuarios.findUnique({
        where: { id: userId },
        include: { persona: true },
      });

      if (!usuario?.persona) {
        return res.status(404).json({ message: "Persona no encontrada" });
      }

      const persona = await prisma.personas.update({
        where: { id: usuario.persona.id },
        data: req.body,
      });

      res.json(persona);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar perfil" });
    }
  }
);

/**
 * OBTENER PERSONA POR ID
 */
router.get(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const persona = await prisma.personas.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!persona) {
      return res.status(404).json({ message: "Persona no encontrada" });
    }

    res.json(persona);
  }
);

/**
 * ACTUALIZAR PERSONA
 */
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const id = Number(req.params.id);

    const persona = await prisma.personas.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: "Persona actualizada",
      persona,
    });
  }
);

/**
 * ACTUALIZAR FOTO DE PERFIL
 * (ADMIN y ASISTENTE pueden cambiar su foto)
 */
router.put(
  "/:id/foto",
  authMiddleware,
  requireRole("admin", "asistente"),
  actualizarFotoPersona
);

/**
 * ELIMINAR PERSONA
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    await prisma.personas.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Persona eliminada correctamente" });
  }
);

export default router;
