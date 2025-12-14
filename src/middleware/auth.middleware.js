import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

export async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = auth.replace("Bearer ", "");

  try {
    // SOLO decodificar (Supabase ya validó)
    const payload = jwt.decode(token);

    if (!payload || !payload.sub) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Buscar usuario interno
    const usuario = await prisma.usuarios.findUnique({
      where: { id: payload.sub },
    });

    if (!usuario) {
      return res.status(403).json({ message: "Usuario no autorizado" });
    }

    req.user = usuario; // { id, persona_id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Error de autenticación" });
  }
}
