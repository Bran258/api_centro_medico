import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * CREAR CITA – PÚBLICO
 * Crea cliente público + cita en estado PENDIENTE
 */
router.post("/", async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      telefono,
      email,
      fecha_solicitada,
      hora_solicitada,
      sintomas,
    } = req.body;

    if (!nombres || !telefono || !fecha_solicitada || !hora_solicitada) {
      return res.status(400).json({
        message: "Datos obligatorios incompletos",
      });
    }

    // 1. Crear cliente público
    const cliente = await prisma.clientes_publicos.create({
      data: {
        nombres: nombres.trim(),
        apellidos: apellidos?.trim() || null,
        telefono,
        email: email?.trim() || null,
      },
    });

    // 2. Crear cita
    const cita = await prisma.citas.create({
      data: {
        cliente_id: cliente.id,
        fecha_solicitada: new Date(`${fecha_solicitada}T00:00:00`),
        hora_solicitada: new Date(`1970-01-01T${hora_solicitada}:00`),
        sintomas: sintomas?.trim() || null,
        estado: "pendiente",
      },
    });

    res.status(201).json({
      message: "Cita registrada",
      cita,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar cita" });
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
            include: {
              persona: true,
              especialidad: true,
            },
          },
        },
        orderBy: { fecha_solicitada: "asc" },
      });

      res.json(citas);
    } catch (error) {
      console.error(error);
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
            include: {
              persona: true,
              especialidad: true,
            },
          },
        },
      });

      if (!cita) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      res.json(cita);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener cita" });
    }
  }
);

/**
 * CONFIRMAR / ASIGNAR CITA – ADMIN / ASISTENTE
 * Aquí se vincula la cita con el MÉDICO
 */
router.put(
  "/:id/confirmar",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { medico_id } = req.body;

      if (!medico_id) {
        return res.status(400).json({
          message: "medico_id es obligatorio",
        });
      }

      const cita = await prisma.citas.update({
        where: { id },
        data: {
          medico_id: Number(medico_id),
          estado: "confirmada",
          fecha_confirmada: new Date(), // SOLO DATE
          hora_confirmada: new Date(),  // SOLO TIME
        },
      });

      res.json({
        message: "Cita confirmada correctamente",
        cita,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al confirmar cita",
      });
    }
  }
);

router.get(
  "/buscar",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || !q.trim()) {
        return res.json([]);
      }

      const citas = await prisma.citas.findMany({
        where: {
          cliente: {
            OR: [
              { nombres: { contains: q, mode: "insensitive" } },
              { apellidos: { contains: q, mode: "insensitive" } },
            ],
          },
        },
        include: {
          cliente: true,
          medico: {
            include: {
              persona: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: 10,
      });

      res.json(citas);
    } catch (error) {
      console.error("BUSCAR CITAS:", error);
      res.status(500).json({ message: "Error al buscar citas" });
    }
  }
);

router.put(
  "/:id/atender",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const cita = await prisma.citas.findUnique({
        where: { id },
      });

      if (!cita) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      if (cita.estado !== "confirmada") {
        return res.status(400).json({
          message: "Solo se pueden atender citas confirmadas",
        });
      }

      const actualizada = await prisma.citas.update({
        where: { id },
        data: {
          estado: "atendida",
        },
      });

      res.json({
        message: "Cita marcada como atendida",
        cita: actualizada,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al marcar cita como atendida",
      });
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
          medico_id: null,
        },
      });

      res.json({
        message: "Cita cancelada",
        cita,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al cancelar cita" });
    }
  }
);

/**
 * ELIMINAR CITA – SOLO ADMIN
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
      console.error(error);
      res.status(500).json({ message: "Error al eliminar cita" });
    }
  }
);

export default router;