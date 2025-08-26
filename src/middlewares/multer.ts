import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: "image-service",
    use_filename: true,
    unique_filename: true,
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, crop: "limit" }],
    resource_type: "image",
    public_id: file.originalname.split(".")[0],
  }),
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});
