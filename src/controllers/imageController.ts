import { Request, Response } from "express";
import { Image } from "../models/Image";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
  file?: Express.Multer.File & {
    path: string;
    filename: string;
  };
}

export const uploadImage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const file = req.file;
  const userId = req.user?.userId;

  if (!file || !file.path) {
    res.status(400).json({ message: "No se subió ninguna imagen válida" });
    return;
  }

  try {
    const optimizedUrl = file.path.replace(
      "/upload/",
      "/upload/f_auto,q_auto/"
    );

    const image = await Image.create({
      filename: file.originalname,
      url: optimizedUrl,
      format: file.mimetype.split("/")[1],
      public_id: file.filename,
      userId,
    });

    res.status(201).json({
      message: "Imagen subida exitosamente",
      image,
    });
  } catch (error) {
    console.error("❌ Error al subir imagen:", error);
    res.status(500).json({ message: "Error al subir imagen" });
  }
};

export const getUserImages = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Usuario no autenticado" });
    return;
  }

  try {
    const images = await Image.find({ userId }).sort({ createdAt: -1 });

    if (images.length === 0) {
      res
        .status(404)
        .json({ message: "No se encontraron imágenes para este usuario" });
      return;
    }

    res.status(200).json(images);
  } catch (error) {
    console.error("❌ Error al obtener imágenes del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getImageById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "ID de imagen inválido" });
    return;
  }

  try {
    const image = await Image.findById(id);

    if (!image) {
      res.status(404).json({ message: "Imagen no encontrada" });
      return;
    }

    res.status(200).json(image);
  } catch (error) {
    console.error("Error al buscar imagen:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteImage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const image = await Image.findById(id);

    if (!image) {
      res.status(404).json({ message: "Imagen no encontrada" });
      return;
    }

    if (image.userId.toString() !== userId) {
      res
        .status(403)
        .json({ message: "No tienes permiso para eliminar esta imagen" });
      return;
    }

    if (!image.public_id) {
      res.status(400).json({ message: "Falta el public_id de la imagen" });
      return;
    }

    await Promise.all([
      cloudinary.uploader.destroy(image.public_id),
      Image.findByIdAndDelete(id),
    ]);

    res.status(200).json({ message: "Imagen eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    res.status(500).json({ message: "Error al eliminar imagen" });
  }
};
