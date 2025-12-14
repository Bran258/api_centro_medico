import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * ==============================
 * GET /api/especialidades
 * Público (frontend)
 * ==============================
 */
router.get("/", async (req, res) => {
  try {
    const data = await prisma.especialidades.findMany({
      orderBy: { nombre: "asc" },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al listar especialidades" });
  }
});

/**
 * ==============================
 * POST /api/especialidades
 * Admin
 * ==============================
 */
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    try {
      const esp = await prisma.especialidades.create({
        data: { nombre, descripcion },
      });

      res.status(201).json(esp);
    } catch (error) {
      if (error.code === "P2002") {
        return res
          .status(409)
          .json({ message: "La especialidad ya existe" });
      }
      res.status(500).json({ message: "Error al crear especialidad" });
    }
  }
);

/**
 * ==============================
 * PUT /api/especialidades/:id
 * Admin
 * ==============================
 */
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    try {
      const esp = await prisma.especialidades.update({
        where: { id },
        data: { nombre, descripcion },
      });

      res.json(esp);
    } catch (error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ message: "Especialidad no encontrada" });
      }
      res.status(500).json({ message: "Error al actualizar especialidad" });
    }
  }
);

/**
 * ==============================
 * DELETE /api/especialidades/:id
 * Admin
 * ==============================
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    const id = Number(req.params.id);

    try {
      await prisma.especialidades.delete({
        where: { id },
      });

      res.json({ message: "Especialidad eliminada correctamente" });
    } catch (error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ message: "Especialidad no encontrada" });
      }

      if (error.code === "P2003") {
        return res.status(409).json({
          message: "No se puede eliminar: hay médicos asignados",
        });
      }

      res.status(500).json({ message: "Error al eliminar especialidad" });
    }
  }
);

export default router;


