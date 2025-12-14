import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * CREAR CITA – PÚBLICO
 */
router.post("/", async (req, res) => {
  try {
    const {
      cliente_id,
      fecha_solicitada,
      hora_solicitada,
      sintomas,
    } = req.body;

    if (!fecha_solicitada || !hora_solicitada) {
      return res.status(400).json({ message: "Fecha y hora son obligatorias" });
    }

    const cita = await prisma.citas.create({
      data: {
        cliente_id: cliente_id || null,
        fecha_solicitada: new Date(`${fecha_solicitada}T00:00:00Z`),
        hora_solicitada: new Date(`1970-01-01T${hora_solicitada}:00Z`),
        sintomas,
        estado: "pendiente",
      },
    });

    res.status(201).json({
      message: "Cita solicitada",
      cita,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error al crear cita" });
  }
});

/**
 * LISTAR TODAS LAS CITAS – ADMIN / ASISTENTE
 */
router.get(
  "/",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const citas = await prisma.citas.findMany({
        include: {
          cliente: true,
          medico: {
            include: { especialidad: true },
          },
        },
        orderBy: { fecha_solicitada: "asc" },
      });

      res.json(citas);
    } catch (error) {
      res.status(500).json({ message: "Error al listar citas" });
    }
  }
);

/**
 * OBTENER CITA POR ID – ADMIN / ASISTENTE
 */
router.get(
  "/:id",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const cita = await prisma.citas.findUnique({
        where: { id },
        include: {
          cliente: true,
          medico: {
            include: { especialidad: true },
          },
        },
      });

      if (!cita) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      res.json(cita);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener cita" });
    }
  }
);

/**
 * ACTUALIZAR CITA – ADMIN / ASISTENTE
 */
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const existe = await prisma.citas.findUnique({
        where: { id },
      });

      if (!existe) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      const cita = await prisma.citas.update({
        where: { id },
        data: req.body,
      });

      res.json({
        message: "Cita actualizada",
        cita,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar cita" });
    }
  }
);

/**
 * CONFIRMAR / ASIGNAR CITA – ADMIN / ASISTENTE
 */
router.put(
  "/:id/confirmar",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const cita = await prisma.citas.update({
        where: { id },
        data: {
          ...req.body,
          estado: "confirmada",
        },
      });

      res.json({
        message: "Cita confirmada",
        cita,
      });
    } catch (error) {
      res.status(500).json({ message: "Error al confirmar cita" });
    }
  }
);

/**
 * CANCELAR CITA – ADMIN / ASISTENTE
 */
router.put(
  "/:id/cancelar",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const cita = await prisma.citas.update({
        where: { id },
        data: {
          estado: "cancelada",
        },
      });

      res.json({
        message: "Cita cancelada",
        cita,
      });
    } catch (error) {
      res.status(500).json({ message: "Error al cancelar cita" });
    }
  }
);

/**
 * ELIMINAR CITA – ADMIN
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      await prisma.citas.delete({
        where: { id },
      });

      res.json({ message: "Cita eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar cita" });
    }
  }
);

export default router;
