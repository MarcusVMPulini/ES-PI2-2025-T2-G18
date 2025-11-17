//Autor: Marcus

//imports
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { boletimPorAluno } from "../controllers/boletim.controller";
//variavel manipulacao
const router = Router();
//rotas
router.use(authMiddleware);

router.get("/:idAluno", boletimPorAluno);

export default router;
