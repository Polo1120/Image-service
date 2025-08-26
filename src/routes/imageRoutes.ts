import { Router } from "express";
import {
  uploadImage,
  getUserImages,
  getImageById,
  deleteImage,
  searchImages,
  getTimeline,
} from "../controllers/imageController";
import { authenticateToken } from "../middlewares/auth";
import { upload } from "../middlewares/uploadMiddleware";
import { imageUploadLimiter } from "../middlewares/rateLimiter";
import { AuthenticatedMulterRequest } from "../types/AuthenticatedMulterRequest";

const router = Router();

router.post(
  "/upload",
  authenticateToken,
  (req, res, next) => {
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  imageUploadLimiter,
  (req: AuthenticatedMulterRequest, res, next) => {
    uploadImage(req, res).catch(next);
  }
);

router.get("/", authenticateToken, getUserImages);


router.get("/search", authenticateToken, searchImages);
router.get("/timeline", authenticateToken, getTimeline);


router.get("/:id", authenticateToken, getImageById);
router.delete("/:id/delete", authenticateToken, deleteImage);

export default router;
