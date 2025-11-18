//Autor: Marcus

//imports
import { Router } from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/auth.controller";
//variavel manipulacao
const router = Router();
//rotas
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
