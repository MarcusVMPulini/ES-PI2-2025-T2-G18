import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarMatriculas,
  matricularAluno,
  removerMatricula
} from "../controllers/matricula.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listarMatriculas);
router.post("/", matricularAluno);
router.delete("/:idAluno/:idTurma", removerMatricula);

export default router;
