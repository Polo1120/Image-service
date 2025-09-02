import { Router } from "express";
import { login, register, getUserProfile, updateUserProfile, changePassword } from "../controllers/authController";
import { validateLogin, validateRegister } from "../validators/authValidator";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticateToken } from "../middlewares/auth";

const router = Router();


router.post("/register", validateRegister, validateRequest, register);


router.post("/login", validateLogin, validateRequest, login);

router.get("/profile", authenticateToken, getUserProfile);

router.put("/profile", authenticateToken, updateUserProfile);

router.put("/password", authenticateToken, changePassword);

export default router;
