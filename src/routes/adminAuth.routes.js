import { Router } from "express";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * CREAR USUARIO EN SUPABASE AUTH (ADMIN)
 * NO cambia sesión
 */
router.post(
  "/crear-auth",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email y contraseña son obligatorios",
        });
      }

      const { data, error } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json({
        auth_user_id: data.user.id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creando usuario auth" });
    }
  }
);

export default router;
