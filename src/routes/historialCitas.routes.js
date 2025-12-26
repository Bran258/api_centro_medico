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
      const { cita_id, medico_id, diagnostico, observaciones } = req.body;

      if (!cita_id) {
        return res.status(400).json({ message: "cita_id es obligatorio" });
      }

      const historial = await prisma.historial_citas.create({
        data: {
          cita_id,
          medico_id: medico_id || null,
          diagnostico: diagnostico || null,
          observaciones: observaciones || null,
        },
      });

      res.status(201).json({ historial });
    } catch (error) {
      console.error(error);
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
      const historial = await prisma.historial_citas.findMany({
        include: {
          cita: {
            include: {
              cliente: true,
              medico: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      res.json(historial);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al listar historial" });
    }
  }
);

/**
 * READ – POR ID
 */
router.get(
  "/:id",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const historial = await prisma.historial_citas.findUnique({
        where: { id },
        include: {
          cita: {
            include: {
              cliente: true,
              medico: true,
            },
          },
        },
      });

      if (!historial) {
        return res.status(404).json({ message: "Historial no encontrado" });
      }

      res.json(historial);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener historial" });
    }
  }
);

/**
 * READ – POR CITA
 */
router.get(
  "/cita/:cita_id",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const cita_id = Number(req.params.cita_id);

      const historial = await prisma.historial_citas.findMany({
        where: { cita_id },
        orderBy: { created_at: "desc" },
      });

      res.json(historial);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener historial por cita" });
    }
  }
);

/**
 * READ – POR CLIENTE
 */
router.get(
  "/cliente/:cliente_id",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const cliente_id = Number(req.params.cliente_id);

      const historial = await prisma.historial_citas.findMany({
        where: {
          cita: { cliente_id },
        },
        include: {
          cita: {
            include: {
              cliente: true,
              medico: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      res.json(historial);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener historial del cliente" });
    }
  }
);

/**
 * UPDATE – BLOQUEADO
 */
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    res.status(403).json({
      message: "El historial clínico no se puede modificar",
    });
  }
);

/**
 * DELETE – BLOQUEADO
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    res.status(403).json({
      message: "El historial clínico no se puede eliminar",
    });
  }
);

export default router;
