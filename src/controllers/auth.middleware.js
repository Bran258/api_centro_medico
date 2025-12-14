import { createClient } from "@supabase/supabase-js";
import prisma from "../prisma.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const authRequired = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "No token" });

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.status(401).json({ error: "Token inválido" });

  req.user = data.user;
  next();
};

export const requireRole = (role) => {
  return async (req, res, next) => {
    const userId = req.user.id;

    const usuario = await prisma.usuarios.findUnique({
      where: { id: userId }
    });

    if (!usuario || usuario.role !== role) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    next();
  };
};
