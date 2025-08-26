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
app.use(cors());
const PORT = process.env.PORT || 3000;

const swaggerDocument = YAML.load("./openapi.yaml");


app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  if (req.path.startsWith("/docs")) {
    return next();
  }
  return checkApiKey(req, res, next);
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);


app.use(
  OpenApiValidator.middleware({
    apiSpec: swaggerDocument,
    validateRequests: true,
    validateResponses: true,
    ignorePaths: /docs/,
  })
);


app.get("/", (_req, res) => {
  res.send("🚀 Image processing service is running");
});


app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`✅ Server listening on port :${PORT}`);
});
