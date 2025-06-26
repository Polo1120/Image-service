import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import imageRoutes from "./routes/imageRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { checkApiKey } from "./middlewares/checkApiKey";

// Configurar variables de entorno
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
app.use(checkApiKey);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);



// Ruta raíz
app.get("/", (_req, res) => {
  res.send("🚀 Servicio de procesamiento de imágenes funcionando");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
