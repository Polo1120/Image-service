import { body } from "express-validator";

export const validateRegister = [
  body("email").isEmail().withMessage("Email no válido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
];

export const validateLogin = [
  body("email").isEmail().withMessage("Email no válido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];
