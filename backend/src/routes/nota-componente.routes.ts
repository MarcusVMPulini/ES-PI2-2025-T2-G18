import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarNotasPorTurma,
  listarNotasPorComponente,
  lancarNotaComponente,
  editarNota,
  calcularNotaFinal,
  excluirNota,
} from "../controllers/nota-componente.controller";

const router = Router();

router.use(authMiddleware);

// Rotas específicas primeiro
router.get("/turma/:idTurma", listarNotasPorTurma);
router.get("/turma/:idTurma/componente/:idComponente", listarNotasPorComponente);
router.post("/turma/:idTurma/componente/:idComponente", lancarNotaComponente);
router.get("/turma/:idTurma/aluno/:idAluno/nota-final", calcularNotaFinal);

// Rotas gerais
router.put("/:id", editarNota);
router.delete("/:id", excluirNota);

export default router;

