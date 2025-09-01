"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imageController_1 = require("../controllers/imageController");
const auth_1 = require("../middlewares/auth");
const multer_1 = require("../middlewares/multer");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.post("/upload", auth_1.authenticateToken, (req, res, next) => {
    multer_1.upload.single("file")(req, res, (err) => {
        if (err)
            return res.status(400).json({ message: err.message });
        next();
    });
}, rateLimiter_1.imageUploadLimiter, (req, res, next) => {
    (0, imageController_1.uploadImage)(req, res).catch(next);
});
router.get("/", auth_1.authenticateToken, imageController_1.getUserImages);
router.get("/search", auth_1.authenticateToken, imageController_1.searchImages);
router.get("/timeline", auth_1.authenticateToken, imageController_1.getTimeline);
router.get("/:id", auth_1.authenticateToken, imageController_1.getImageById);
router.delete("/:id/delete", auth_1.authenticateToken, imageController_1.deleteImage);
exports.default = router;
