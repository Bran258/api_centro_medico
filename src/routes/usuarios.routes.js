import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * ======================================================
 * OBTENER ROL POR ID DE SUPABASE
 * se usa al hacer login con Supabase
 * NO lleva authMiddleware
 * ======================================================
 */
router.get("/supabase/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuarios.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no registrado en el sistema",
      });
    }

    res.json({ role: usuario.role });
  } catch (error) {
    console.error("Error obteniendo rol:", error);
    res.status(500).json({ message: "Error interno" });
  }
});

/**
 * ======================================================
 * CREAR USUARIO (ADMIN)
 * id = UUID de Supabase Auth
 * ======================================================
 */
router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id, persona_id, role } = req.body;

      if (!id || !role) {
        return res.status(400).json({ message: "id y role son obligatorios" });
      }

      const existe = await prisma.usuarios.findUnique({
        where: { id },
      });

      if (existe) {
        return res.status(409).json({ message: "Usuario ya existe" });
      }

      const usuario = await prisma.usuarios.create({
        data: {
          id,
          persona_id: persona_id || null,
          role,
        },
      });

      res.status(201).json({
        message: "Usuario creado",
        usuario,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear usuario" });
    }
  }
);

/**
 * ======================================================
 * LISTAR USUARIOS (ADMIN)
 * ======================================================
 */
router.get(
  "/",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const usuarios = await prisma.usuarios.findMany({
        include: {
          persona: true,
        },
        orderBy: { created_at: "desc" },
      });

      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  }
);

/**
 * ======================================================
 * OBTENER MI PERFIL (ADMIN / ASISTENTE)
 * ======================================================
 */
router.get(
  "/me",
  authMiddleware,
  requireRole("admin", "asistente"),
  async (req, res) => {
    try {
      // req.user.id debe venir del authMiddleware (supabase user id)
      const userId = req.user.id;

      const usuario = await prisma.usuarios.findUnique({
        where: { id: userId },
        include: { persona: true },
      });

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(usuario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener perfil" });
    }
  }
);

/**
 * ======================================================
 * OBTENER USUARIO POR ID (ADMIN)
 * ======================================================
 */
router.get(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuarios.findUnique({
        where: { id },
        include: {
          persona: true,
        },
      });

      if (!usuario) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuario" });
    }
  }
);

/**
 * ======================================================
 * ACTUALIZAR USUARIO COMPLETO (ADMIN)
 * ======================================================
 */
router.put(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { persona_id, role } = req.body;

      const existe = await prisma.usuarios.findUnique({
        where: { id },
      });

      if (!existe) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const usuario = await prisma.usuarios.update({
        where: { id },
        data: {
          persona_id: persona_id ?? existe.persona_id,
          role: role ?? existe.role,
        },
      });

      res.json({
        message: "Usuario actualizado",
        usuario,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  }
);

/**
 * ======================================================
 * ACTUALIZAR SOLO ROL (ADMIN)
 * ======================================================
 */
router.put(
  "/:id/rol",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ message: "Role es obligatorio" });
      }

      const usuario = await prisma.usuarios.update({
        where: { id },
        data: { role },
      });

      res.json({
        message: "Rol actualizado",
        usuario,
      });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar rol" });
    }
  }
);

/**
 * ======================================================
 * ELIMINAR USUARIO (ADMIN)
 * ======================================================
 */
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const existe = await prisma.usuarios.findUnique({
        where: { id },
      });

      if (!existe) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await prisma.usuarios.delete({
        where: { id },
      });

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  }
);

export default router;