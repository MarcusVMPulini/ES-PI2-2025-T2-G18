import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { boletimPorAluno } from "../controllers/boletim.controller";

const router = Router();

router.use(authMiddleware);

router.get("/:idAluno", boletimPorAluno);

export default router;
