import express from "express";
import { login, register, forgotPassword, resetPassword,  getNivelByEmail } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);
router.post("/nivel", getNivelByEmail);

export default router;