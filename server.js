import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Importar rutas
import categoriasRouter from "./routes/categorias.js";
import menusRouter from "./routes/menus.js";
import pedidosRouter from "./routes/pedidos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar variables de entorno
dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// ─── Middlewares ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging básico
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Rutas ────────────────────────────────────────────────────
app.use("/api/categorias", categoriasRouter);
app.use("/api/menus", menusRouter);
app.use("/api/pedidos", pedidosRouter);

// ─── Frontend (archivos estáticos) ────────────────────────────
const FRONTEND_PATH = path.join(__dirname, "frontend");
app.use(express.static(FRONTEND_PATH));

// Ruta raíz de bienvenida
app.get("/", (req, res) => {
  res.json({
    mensaje: "API Gestor de Pedidos de Restaurante",
    endpoints: {
      categorias: "/api/categorias",
      menus: "/api/menus",
      pedidos: "/api/pedidos",
    },
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

// ─── Conexión a MongoDB y arranque del servidor ───────────────
const startServer = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("La variable de entorno MONGODB_URI no está definida en .env");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado a MongoDB exitosamente");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📋 Endpoints disponibles:`);
      console.log(`   GET/POST       http://localhost:${PORT}/api/categorias`);
      console.log(`   PUT/DELETE     http://localhost:${PORT}/api/categorias/:id`);
      console.log(`   GET/POST       http://localhost:${PORT}/api/menus`);
      console.log(`   PUT/DELETE     http://localhost:${PORT}/api/menus/:id`);
      console.log(`   GET/POST       http://localhost:${PORT}/api/pedidos`);
      console.log(`   PUT/DELETE     http://localhost:${PORT}/api/pedidos/:id`);
      console.log(`   🖥️  Frontend:     http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();
