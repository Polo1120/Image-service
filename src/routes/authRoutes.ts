import { Router } from "express";
import { login, register } from "../controllers/authController";
import { validateLogin, validateRegister } from "../validators/authValidator";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();

// Ruta para registro de usuarios
router.post("/register", validateRegister, validateRequest, register);

// Ruta para inicio de sesión
router.post("/login", validateLogin, validateRequest, login);

export default router;
