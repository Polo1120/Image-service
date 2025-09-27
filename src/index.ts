import express from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import imageRoutes from "./routes/imageRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { checkApiKey } from "./middlewares/checkApiKey";
dotenv.config();
connectDB();

const app = express();


const TRUST_PROXY = process.env.TRUST_PROXY;
if (TRUST_PROXY) {
  const numeric = Number(TRUST_PROXY);
  if (!Number.isNaN(numeric)) {
    app.set("trust proxy", numeric);
  } else if (["loopback", "uniquelocal", "linklocal"].includes(TRUST_PROXY)) {
    app.set("trust proxy", TRUST_PROXY as any);
  } else {
    app.set("trust proxy", TRUST_PROXY.split(",").map((s) => s.trim()) as any);
  }
}


const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
   
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) {
      return callback(new Error("CORS not configured"), false);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  maxAge: 600, // cache de preflight
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", checkApiKey);
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 Image processing service is running");
});

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;

