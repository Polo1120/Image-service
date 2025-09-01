"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageUploadLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.imageUploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        message: "Have exceeded the upload limit. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
