import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import imageRoutes from "./routes/imageRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { checkApiKey } from "./middlewares/checkApiKey";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", checkApiKey);

app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 Image processing service is running");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server listening on port :${PORT}`);
});
