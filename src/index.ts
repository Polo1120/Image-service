import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import imageRoutes from "./routes/imageRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { checkApiKey } from "./middlewares/checkApiKey";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import * as OpenApiValidator from "express-openapi-validator";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerDocument = YAML.load("./openapi.yaml");

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verificar API Key antes de las rutas protegidas
app.use(checkApiKey);

// Rutas (incluyen multer internamente en imageRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

// Validación de OpenAPI (después de las rutas con multer)
app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerDocument,
    validateRequests: true,
    validateResponses: true,
    ignorePaths: /docs/,
  })
);

// Ruta raíz
app.get("/", (_req, res) => {
  res.send("🚀 Servicio de procesamiento de imágenes funcionando");
});

// Middleware de manejo de errores (siempre al final)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
