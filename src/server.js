import express from "express";
import cors from "cors";

import personasRoutes from "./routes/personas.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import medicosRoutes from "./routes/medicos.routes.js";
import especialidadesRoutes from "./routes/especialidades.routes.js";
import citasRoutes from "./routes/citas.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";
import historiasRoutes from "./routes/historialCitas.routes.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/personas", personasRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/medicos", medicosRoutes);
app.use("/api/especialidades", especialidadesRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/historial", historiasRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/dashboard", dashboardRoutes);

// FAVICON (EVITA CRASH)
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());


// app.listen(3000, () => {
//   console.log("API Centro Médico activa en puerto 3000");
// });


export default app;