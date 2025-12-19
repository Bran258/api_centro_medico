import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * DASHBOARD – ESTADÍSTICAS GENERALES
 */
router.get(
  "/stats",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const manana = new Date(hoy);
      manana.setDate(hoy.getDate() + 1);

      const [
        citasHoy,
        pendientes,
        confirmadas,
        atendidas,
        canceladas,
      ] = await Promise.all([
        prisma.citas.count({
          where: {
            fecha_solicitada: {
              gte: hoy,
              lt: manana,
            },
          },
        }),
        prisma.citas.count({ where: { estado: "pendiente" } }),
        prisma.citas.count({ where: { estado: "confirmada" } }),
        prisma.citas.count({ where: { estado: "atendida" } }),
        prisma.citas.count({ where: { estado: "cancelada" } }),
      ]);

      res.json({
        citasHoy,
        pendientes,
        confirmadas,
        atendidas,
        canceladas,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error dashboard stats" });
    }
  }
);

/**
 * DASHBOARD – CITAS POR ESTADO
 */
router.get(
  "/citas-por-estado",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const data = await prisma.citas.groupBy({
        by: ["estado"],
        _count: { estado: true },
      });

      res.json(
        data.map((d) => ({
          estado: d.estado,
          total: d._count.estado,
        }))
      );
    } catch (error) {
      res.status(500).json({ message: "Error citas por estado" });
    }
  }
);

/**
 * DASHBOARD – CITAS ÚLTIMOS 7 DÍAS
 */
router.get(
  "/citas-ultimos-7-dias",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const desde = new Date();
      desde.setDate(desde.getDate() - 6);
      desde.setHours(0, 0, 0, 0);

      const citas = await prisma.citas.findMany({
        where: {
          created_at: { gte: desde },
        },
        select: {
          created_at: true,
        },
      });

      const resumen = {};

      for (let i = 0; i < 7; i++) {
        const d = new Date(desde);
        d.setDate(desde.getDate() + i);
        const key = d.toISOString().split("T")[0];
        resumen[key] = 0;
      }

      citas.forEach((c) => {
        const key = c.created_at.toISOString().split("T")[0];
        if (resumen[key] !== undefined) resumen[key]++;
      });

      res.json(
        Object.entries(resumen).map(([fecha, total]) => ({
          fecha,
          total,
        }))
      );
    } catch (error) {
      res.status(500).json({ message: "Error citas últimos días" });
    }
  }
);

/**
 * DASHBOARD – PRÓXIMAS CITAS
 */
router.get(
  "/proximas-citas",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      const citas = await prisma.citas.findMany({
        where: {
          estado: { in: ["pendiente", "confirmada"] },
        },
        include: {
          cliente: true,
          medico: {
            include: { especialidad: true },
          },
        },
        orderBy: [
          { fecha_solicitada: "asc" },
          { hora_solicitada: "asc" },
        ],
        take: 5,
      });

      res.json(citas);
    } catch (error) {
      res.status(500).json({ message: "Error próximas citas" });
    }
  }
);

export default router;
