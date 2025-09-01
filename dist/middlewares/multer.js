"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("../config/cloudinary");
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.cloudinary,
    params: (_req, file) => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            folder: "image-service",
            use_filename: true,
            unique_filename: true,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [{ width: 800, crop: "limit" }],
            resource_type: "image",
            public_id: file.originalname.split(".")[0],
        });
    }),
});
const fileFilter = (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});
