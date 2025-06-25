import { Request, Response } from "express";
import { Image } from "../models/Image";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

export const uploadImage = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  const userId = (req as any).user.userId;

  if (!file || !file.path) {
    return res
      .status(400)
      .json({ message: "No se subió ninguna imagen válida" });
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

export const getUserImages = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const images = await Image.find({ userId }).sort({ createdAt: -1 });

    if (images.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron imágenes para este usuario" });
    }

    res.status(200).json(images);
  } catch (error) {
    console.error("Error al obtener imágenes del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getImageById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de imagen inválido" });
  }

  try {
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    res.status(200).json(image);
  } catch (error) {
    console.error("Error al buscar imagen:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.userId;

  try {
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    if (image.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar esta imagen" });
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
