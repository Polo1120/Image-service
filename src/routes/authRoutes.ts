import { Router } from "express";
import { login, register } from "../controllers/authController";
import { validateLogin, validateRegister } from "../validators/authValidator";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();


router.post("/register", validateRegister, validateRequest, register);


router.post("/login", validateLogin, validateRequest, login);

export default router;
