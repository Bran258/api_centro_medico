import prisma from "../prisma.js";

/**
 * ==============================
 * LISTAR MÉDICOS (PÚBLICO)
 * ==============================
 */
export async function listarMedicos(req, res) {
  try {
    const medicos = await prisma.medicos.findMany({
      where: { activo: true },
      include: {
        persona: {
          select: {
            nombres: true,
            apellidos: true,
            telefono: true,
          },
        },
        especialidad: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(medicos);
  } catch (error) {
    res.status(500).json({ message: "Error al listar médicos" });
  }
}

/**
 * ==============================
 * CREAR MÉDICO (ADMIN)
 * ==============================
 */
export async function crearMedico(req, res) {
  const { persona_id, especialidad_id, email, colegiatura } = req.body;

  if (!persona_id || !especialidad_id || !email) {
    return res.status(400).json({
      message: "persona_id, especialidad_id y email son obligatorios",
    });
  }

  try {
    // Validar persona existente
    const persona = await prisma.personas.findUnique({
      where: { id: persona_id },
    });

    if (!persona) {
      return res.status(404).json({ message: "Persona no existe" });
    }

    const medico = await prisma.medicos.create({
      data: {
        persona_id,
        especialidad_id,
        email,
        colegiatura,
      },
    });

    res.status(201).json(medico);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "El médico ya existe (email o persona duplicada)",
      });
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Especialidad no válida",
      });
    }

    res.status(500).json({ message: "Error al crear médico" });
  }
}

/**
 * ==============================
 * ACTUALIZAR MÉDICO (ADMIN)
 * ==============================
 */
export async function actualizarMedico(req, res) {
  const id = Number(req.params.id);
  const { especialidad_id, email, colegiatura, activo } = req.body;

  try {
    const medico = await prisma.medicos.update({
      where: { id },
      data: {
        especialidad_id,
        email,
        colegiatura,
        activo,
      },
    });

    res.json(medico);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Médico no encontrado" });
    }

    res.status(500).json({ message: "Error al actualizar médico" });
  }
}

/**
 * ==============================
 * ELIMINAR MÉDICO (ADMIN)
 * ==============================
 * 
 */
export async function eliminarMedico(req, res) {
  const id = Number(req.params.id);

  try {
    await prisma.medicos.update({
      where: { id },
      data: { activo: false },
    });

    res.json({ message: "Médico desactivado correctamente" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Médico no encontrado" });
    }

    res.status(500).json({ message: "Error al eliminar médico" });
  }
}


