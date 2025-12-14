import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * CREAR PERSONA (ADMIN)
 * - Si el DNI existe, devuelve la persona existente
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
      console.error(error);
      res.status(500).json({ message: "Error al crear persona" });
    }
  }
);

/**
 * LISTAR TODAS LAS PERSONAS (ADMIN)
 */
router.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const personas = await prisma.personas.findMany({
        orderBy: { id: "desc" },
      });
      res.json(personas);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener personas" });
    }
  }
);

/**
 * OBTENER PERSONA POR ID (ADMIN)
 */
router.get(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const persona = await prisma.personas.findUnique({
        where: { id },
      });

      if (!persona) {
        return res.status(404).json({ message: "Persona no encontrada" });
      }

      res.json(persona);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener persona" });
    }
  }
);

/**
 * ACTUALIZAR PERSONA (ADMIN)
 */
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const persona = await prisma.personas.findUnique({
        where: { id },
      });

      if (!persona) {
        return res.status(404).json({ message: "Persona no encontrada" });
      }

      const actualizada = await prisma.personas.update({
        where: { id },
        data: req.body,
      });

      res.json({
        message: "Persona actualizada",
        persona: actualizada,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar persona" });
    }
  }
);

/**
 * ELIMINAR PERSONA (ADMIN)
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const persona = await prisma.personas.findUnique({
        where: { id },
      });

      if (!persona) {
        return res.status(404).json({ message: "Persona no encontrada" });
      }

      await prisma.personas.delete({
        where: { id },
      });

      res.json({ message: "Persona eliminada correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar persona" });
    }
  }
);

export default router;
