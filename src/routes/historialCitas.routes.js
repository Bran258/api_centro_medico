import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * CREATE – REGISTRAR HISTORIAL
 */
router.post(
  "/",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const { cita_id, notas } = req.body;

      if (!cita_id) {
        return res.status(400).json({ message: "cita_id es obligatorio" });
      }

      const historial = await prisma.historial.create({
        data: {
          cita_id,
          notas: notas || null,
        },
      });

      res.status(201).json({ historial });
    } catch (error) {
      console.error("CREATE HISTORIAL:", error);
      res.status(500).json({ message: "Error al crear historial" });
    }
  }
);

/**
 * READ – LISTAR TODO
 */
router.get(
  "/",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const historial = await prisma.historial.findMany({
        include: {
          cita: {
            include: {
              cliente: true,
              medico: {
                include: {
                  persona: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      res.json(historial);
    } catch (error) {
      console.error("LIST HISTORIAL:", error);
      res.status(500).json({ message: "Error al listar historial" });
    }
  }
);

export default router;
