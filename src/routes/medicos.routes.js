import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  listarMedicosPublicos,
  listarMedicosAdmin,
  crearMedico,
  actualizarMedico,
  eliminarMedico,
} from "../controllers/medicos.controller.js";

const router = Router();

/**
 * ==============================
 * PÚBLICO
 * ==============================
 */
router.get("/public", listarMedicosPublicos);

/**
 * ==============================
 * ADMIN
 * ==============================
 */
router.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  listarMedicosAdmin
);

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  crearMedico
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  actualizarMedico
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  eliminarMedico
);

export default router;
