import { Router } from "express";
import { uploadImage, getUserImages, getImageById} from "../controllers/imageController";
import { authenticateToken } from "../middlewares/auth";
import { upload } from "../middlewares/uploadMiddleware";
import { imageUploadLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/upload", authenticateToken, upload.single("image"), imageUploadLimiter, uploadImage);

router.get("/", authenticateToken, getUserImages);

router.get("/:id", authenticateToken, getImageById);

export default router;
