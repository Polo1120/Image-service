"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email no válido"),
    (0, express_validator_1.body)("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
];
exports.validateLogin = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Email no válido"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("La contraseña es obligatoria"),
];
