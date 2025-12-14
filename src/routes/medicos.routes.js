import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  crearMedico,
  listarMedicos,
  actualizarMedico,
  eliminarMedico,
} from "../controllers/medicos.controller.js";

const router = Router();

/**
 * ==============================
 * LISTAR MÉDICOS (PÚBLICO)
 * ==============================
 */
router.get("/", listarMedicos);

/**
 * ==============================
 * CREAR MÉDICO (ADMIN)
 * ==============================
 */
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  crearMedico
);

/**
 * ==============================
 * ACTUALIZAR MÉDICO (ADMIN)
 * ==============================
 */
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  actualizarMedico
);

/**
 * ==============================
 * ELIMINAR MÉDICO (ADMIN)
 * ==============================
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  eliminarMedico
);

export default router;
