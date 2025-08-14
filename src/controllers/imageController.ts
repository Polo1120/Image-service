import { Request, Response } from "express";
import { Image } from "../models/Image";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { AuthenticatedMulterRequest } from "../types/AuthenticatedMulterRequest";

export const uploadImage = async (
  req: AuthenticatedMulterRequest,
  res: Response
): Promise<void> => {
  const file = req.file;
  const userId = req.user?.userId;

  if (!file || !file.path) {
    res.status(400).json({ message: "No valid image was uploaded" });
    return;
  }

  try {
    const title = req.body.title || undefined;
    const message = req.body.message || undefined;
    const location = req.body.location || undefined;
    const dateSpecial = req.body.dateSpecial
      ? new Date(req.body.dateSpecial)
      : undefined;
    const tags =
      typeof req.body.tags === "string"
        ? req.body.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

    const optimizedUrl = file.path.replace(
      "/upload/",
      "/upload/f_auto,q_auto/"
    );

    const doc = await Image.create({
      filename: file.originalname,
      url: optimizedUrl,
      format: file.mimetype.split("/")[1],
      public_id: file.filename,
      userId,
      title,
      message,
      location,
      dateSpecial,
      tags,
    });

    const image = {
      _id: doc._id.toString(),
      filename: doc.filename,
      url: doc.url,
      public_id: doc.public_id,
      userId: doc.userId.toString(),
      metadata: {
        dateSpecial: doc.dateSpecial ?? undefined,
        location: doc.location ?? undefined,
        title: doc.title ?? undefined,
        message: doc.message ?? undefined,
        tags: Array.isArray(doc.tags) ? doc.tags : [],
      },
      createdAt: doc.createdAt,
    };

    res.status(201).json({
      message: "Image uploaded successfully",
      image,
    });
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
};

export const getUserImages = async (
  req: AuthenticatedMulterRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  try {
    const images = await Image.find({ userId }).sort({ createdAt: -1 });

    if (images.length === 0) {
      res
        .status(404)
        .json({ message: "No images found for this user" });
      return;
    }

    res.status(200).json(images);
  } catch (error) {
    console.error("❌ Error fetching user images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getImageById = async (
  req: AuthenticatedMulterRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid image ID" });
    return;
  }

  try {
    const image = await Image.findById(id);

    if (!image) {
      res.status(404).json({ message: "Image not found" });
      return;
    }

    res.status(200).json(image);
  } catch (error) {
    console.error("Error searching image: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchImages = async (
  req: AuthenticatedMulterRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({ message: "The 'q' parameter is required" });
      return;
    }

    const regex = new RegExp(q, "i");

    const images = await Image.find({
      $or: [{ tags: { $in: [regex] } }, { location: regex }],
    }).sort({ createdAt: -1 });

    res.status(200).json(images);
  } catch (error) {
    console.error("Error searching images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteImage = async (
  req: AuthenticatedMulterRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const image = await Image.findById(id);

    if (!image) {
      res.status(404).json({ message: "Image not found" });
      return;
    }

    if (image.userId.toString() !== userId) {
      res
        .status(403)
        .json({ message: "No permission to delete this image" });
      return;
    }

    if (!image.public_id) {
      res.status(400).json({ message: "Public ID is missing from the image" });
      return;
    }

    await Promise.all([
      cloudinary.uploader.destroy(image.public_id),
      Image.findByIdAndDelete(id),
    ]);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Error deleting image" });
  }
};
