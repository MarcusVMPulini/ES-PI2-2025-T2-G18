import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarTurmas,
  criarTurma,
  editarTurma,
  excluirTurma,
  importarAlunosCSV,
  exportarNotasCSV,
} from "../controllers/turma.controller";

const router = Router();

router.use(authMiddleware);

// Rotas específicas primeiro
router.post("/:idTurma/importar-alunos", importarAlunosCSV);
router.get("/:idTurma/exportar-notas", exportarNotasCSV);

// Rotas gerais
router.get("/", listarTurmas);
router.post("/", criarTurma);
router.put("/:id", editarTurma);
router.delete("/:id", excluirTurma);

export default router;
