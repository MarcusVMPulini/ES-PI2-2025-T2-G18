//Autor: Marcus

//imports
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarMatriculas,
  matricularAluno,
  removerMatricula
} from "../controllers/matricula.controller";
//variavel manipulacao
const router = Router();
//rotas
router.use(authMiddleware);

router.get("/", listarMatriculas);
router.post("/", matricularAluno);
router.delete("/:idAluno/:idTurma", removerMatricula);

export default router;
