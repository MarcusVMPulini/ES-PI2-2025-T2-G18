import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarDisciplinas,
  criarDisciplina,
  editarDisciplina,
  excluirDisciplina,
  definirFormulaNotaFinal,
} from "../controllers/disciplina.controller";

const router = Router();

router.use(authMiddleware);

// Rotas específicas primeiro
router.put("/:id/formula", definirFormulaNotaFinal);

// Rotas gerais
router.get("/", listarDisciplinas);
router.post("/", criarDisciplina);
router.put("/:id", editarDisciplina);
router.delete("/:id", excluirDisciplina);

export default router;
