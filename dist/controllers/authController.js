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
exports.changePassword = exports.updateUserProfile = exports.getUserProfile = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    try {
        const existingUser = yield User_1.User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            res.status(400).json({ message: "User with that email or username already exists" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = new User_1.User({ email, password: hashedPassword, username });
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: "1d",
        });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            },
        });
    }
    catch (error) {
        console.error("❌ Error in register:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.User.findOne({ email });
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            res.status(401).json({ message: "Incorrect email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: "1d",
        });
        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("❌ Error in login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.login = login;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    try {
        const user = yield User_1.User.findById(userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            id: user._id,
            email: user.email,
            username: user.username,
        });
    }
    catch (error) {
        console.error("❌ Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { username, profilePictureUrl } = req.body;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    try {
        const user = yield User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (username && username !== user.username) {
            const existingUserWithUsername = yield User_1.User.findOne({ username });
            if (existingUserWithUsername) {
                res.status(400).json({ message: "Username already taken" });
                return;
            }
            user.username = username;
        }
        if (profilePictureUrl !== undefined)
            user.profilePictureUrl = profilePictureUrl;
        yield user.save();
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                profilePictureUrl: user.profilePictureUrl,
            },
        });
    }
    catch (error) {
        console.error("❌ Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateUserProfile = updateUserProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { currentPassword, newPassword } = req.body;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    if (!currentPassword || !newPassword) {
        res.status(400).json({ message: "Current password and new password are required" });
        return;
    }
    try {
        const user = yield User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Incorrect current password" });
            return;
        }
        const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 10);
        user.password = hashedNewPassword;
        yield user.save();
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error("❌ Error changing password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.changePassword = changePassword;
