import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

/**
 * CREAR CLIENTE – PÚBLICO
 */
router.post("/", async (req, res) => {
  try {
    const cliente = await prisma.clientes_publicos.create({
      data: req.body,
    });

    res.status(201).json({
      message: "Cliente creado",
      cliente,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error al crear cliente" });
  }
});

/**
 * LISTAR CLIENTES – ADMIN / ASISTENTE
 * (si luego se decide protegerlo)
 */
router.get("/", async (req, res) => {
  try {
    const clientes = await prisma.clientes_publicos.findMany({
      orderBy: { created_at: "desc" },
    });

    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: "Error al listar clientes" });
  }
});

/**
 * OBTENER CLIENTE POR ID
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const cliente = await prisma.clientes_publicos.findUnique({
      where: { id },
    });

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener cliente" });
  }
});

/**
 * ACTUALIZAR CLIENTE
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existe = await prisma.clientes_publicos.findUnique({
      where: { id },
    });

    if (!existe) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const cliente = await prisma.clientes_publicos.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: "Cliente actualizado",
      cliente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
});

/**
 * ELIMINAR CLIENTE
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existe = await prisma.clientes_publicos.findUnique({
      where: { id },
    });

    if (!existe) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await prisma.clientes_publicos.delete({
      where: { id },
    });

    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
});

export default router;
