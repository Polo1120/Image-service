"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => err.msg);
        res.status(400).json({ message: extractedErrors.join(", ") });
        return;
    }
    next();
};
exports.validateRequest = validateRequest;
