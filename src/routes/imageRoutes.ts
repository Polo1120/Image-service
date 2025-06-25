import { Router } from "express";
import { uploadImage, getUserImages, getImageById, deleteImage} from "../controllers/imageController";
import { authenticateToken } from "../middlewares/auth";
import { upload } from "../middlewares/uploadMiddleware";
import { imageUploadLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/upload", authenticateToken, (req, res, next) => {
  upload.single("image")(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, imageUploadLimiter, uploadImage);

router.get("/", authenticateToken, getUserImages);

router.get("/:id", authenticateToken, getImageById);

router.delete("/:id", authenticateToken, deleteImage);

export default router;
