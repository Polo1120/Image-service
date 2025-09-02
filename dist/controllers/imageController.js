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
exports.deleteImage = exports.getTimeline = exports.searchImages = exports.getImageById = exports.getUserImages = exports.uploadImage = void 0;
const Image_1 = require("../models/Image");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("cloudinary");
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const file = req.file;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!file || !file.path) {
            res.status(400).json({ message: "No valid image was uploaded" });
            return;
        }
        const { title, description, location } = req.body;
        const dateSpecial = req.body.dateSpecial
            ? new Date(req.body.dateSpecial)
            : undefined;
        let tags = [];
        if (Array.isArray(req.body.tags)) {
            tags = req.body.tags.map((t) => t.trim()).filter(Boolean);
        }
        else if (typeof req.body.tags === "string") {
            tags = req.body.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
        }
        let taggedUsers = [];
        if (req.body.taggedUsernames) {
            let usernamesToTag = [];
            if (Array.isArray(req.body.taggedUsernames)) {
                usernamesToTag = req.body.taggedUsernames
                    .map((u) => u.trim())
                    .filter(Boolean);
            }
            else if (typeof req.body.taggedUsernames === "string") {
                usernamesToTag = req.body.taggedUsernames
                    .split(",")
                    .map((u) => u.trim())
                    .filter(Boolean);
            }
            if (usernamesToTag.length > 0) {
                const foundUsers = yield User_1.User.find({
                    username: { $in: usernamesToTag },
                }).select("_id");
                taggedUsers = foundUsers.map((user) => user._id);
            }
        }
        const optimizedUrl = file.path.replace("/upload/", "/upload/f_auto,q_auto/");
        const doc = yield Image_1.Image.create({
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
                    dateSpecial: (_b = doc.dateSpecial) !== null && _b !== void 0 ? _b : undefined,
                    location: (_c = doc.location) !== null && _c !== void 0 ? _c : undefined,
                    title: (_d = doc.title) !== null && _d !== void 0 ? _d : undefined,
                    description: (_e = doc.description) !== null && _e !== void 0 ? _e : undefined,
                    tags: Array.isArray(doc.tags) ? doc.tags : [],
                },
                createdAt: doc.createdAt,
            },
        });
    }
    catch (error) {
        console.error("❌ Error uploading image:", error);
        res.status(500).json({ message: "Error uploading image" });
    }
});
exports.uploadImage = uploadImage;
const getUserImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    try {
        const images = yield Image_1.Image.find({
            $or: [{ userId }, { taggedUsers: userId }],
        }).sort({ createdAt: -1 });
        res.status(200).json(images);
    }
    catch (error) {
        console.error("❌ Error fetching user images:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUserImages = getUserImages;
const getImageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid image ID" });
        return;
    }
    try {
        const image = yield Image_1.Image.findById(id);
        if (!image) {
            res.status(404).json({ message: "Image not found" });
            return;
        }
        res.status(200).json(image);
    }
    catch (error) {
        console.error("Error searching image: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getImageById = getImageById;
const searchImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const images = yield Image_1.Image.find({
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
    }
    catch (error) {
        console.error("Error searching images:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.searchImages = searchImages;
const getTimeline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield Image_1.Image.find().sort({ createdAt: -1 });
        res.status(200).json(images);
    }
    catch (error) {
        console.error("Error fetching timeline:", error);
        res.status(500).json({ error: "Failed to fetch timeline" });
    }
});
exports.getTimeline = getTimeline;
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const image = yield Image_1.Image.findById(id);
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
        yield Promise.all([
            cloudinary_1.v2.uploader.destroy(image.public_id),
            Image_1.Image.findByIdAndDelete(id),
        ]);
        res.status(200).json({ message: "Image deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ message: "Error deleting image" });
    }
});
exports.deleteImage = deleteImage;
