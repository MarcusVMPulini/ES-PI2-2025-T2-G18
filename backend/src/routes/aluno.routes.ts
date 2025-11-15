import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarAlunos,
  criarAluno,
  editarAluno,
  excluirAluno,
} from "../controllers/aluno.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listarAlunos);
router.post("/", criarAluno);
router.put("/:id", editarAluno);
router.delete("/:id", excluirAluno);

export default router;
