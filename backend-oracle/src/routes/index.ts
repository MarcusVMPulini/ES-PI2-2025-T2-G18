import { Router } from "express";
import authRoutes from "./auth.routes";import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/protegido", authMiddleware, (req, res) => {
    res.json({ message: "Acesso permitido ao usuário logado!" });
});

router.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

router.use("/auth", authRoutes);

export default router;

