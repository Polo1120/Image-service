import { Request, Response } from "express";
import { Image } from "../models/Image";
import { User } from "../models/User";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { AuthenticatedMulterRequest } from "../types/AuthenticatedMulterRequest";

export const uploadImage = async (
  req: AuthenticatedMulterRequest,
  res: Response
): Promise<void> => {
  try {
    const file = req.file;
    const userId = req.user?.userId;

    if (!file || !file.path) {
      res.status(400).json({ message: "No valid image was uploaded" });
      return;
    }

    const { title, description, location } = req.body;
    const dateSpecial = req.body.dateSpecial
      ? new Date(req.body.dateSpecial)
      : undefined;

    let tags: string[] = [];
    if (Array.isArray(req.body.tags)) {
      tags = req.body.tags.map((t: string) => t.trim()).filter(Boolean);
    } else if (typeof req.body.tags === "string") {
      tags = req.body.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }

    let taggedUsers: mongoose.Types.ObjectId[] = [];
    if (req.body.taggedUsernames) {
      let usernamesToTag: string[] = [];
      if (Array.isArray(req.body.taggedUsernames)) {
        usernamesToTag = req.body.taggedUsernames
          .map((u: string) => u.trim())
          .filter(Boolean);
      } else if (typeof req.body.taggedUsernames === "string") {
        usernamesToTag = req.body.taggedUsernames
          .split(",")
          .map((u: string) => u.trim())
          .filter(Boolean);
      }

      if (usernamesToTag.length > 0) {
        const foundUsers = await User.find({
          username: { $in: usernamesToTag },
        }).select("_id");
        taggedUsers = foundUsers.map(
          (user) => user._id as mongoose.Types.ObjectId
        );
      }
    }

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
      description,
      location,
      dateSpecial,
      tags,
      taggedUsers,
    });
    res.status(201).json({
      message: "Image uploaded successfully",
      image: {
        id: doc._id,
        filename: doc.filename,
        url: doc.url,
        public_id: doc.public_id,
        userId: doc.userId.toString(),
        metadata: {
          dateSpecial: doc.dateSpecial ?? undefined,
          location: doc.location ?? undefined,
          title: doc.title ?? undefined,
          description: doc.description ?? undefined,
          tags: Array.isArray(doc.tags) ? doc.tags : [],
        },
        createdAt: doc.createdAt,
      },
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
    const images = await Image.find({
      $or: [{ userId }, { taggedUsers: userId }],
    }).sort({ createdAt: -1 });

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

    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const images = await Image.find({
      $and: [
        {
          $or: [{ userId: req.user.userId }, { taggedUsers: req.user.userId }],
        },
        {
          $or: [
            { title: regex },
            { description: regex },
            { location: regex },
            { tags: { $in: [regex] } },
          ],
        },
      ],
    })
      .populate("userId", "username profileImage")
      .populate("taggedUsers", "username profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(images);
  } catch (error) {
    console.error("Error searching images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTimeline = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching timeline:", error);
    res.status(500).json({ error: "Failed to fetch timeline" });
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
      res.status(403).json({ message: "No permission to delete this image" });
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
