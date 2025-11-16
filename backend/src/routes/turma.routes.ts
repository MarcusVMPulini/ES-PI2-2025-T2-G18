import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarTurmas,
  buscarTurmaPorId,
  criarTurma,
  editarTurma,
  excluirTurma,
  importarAlunosCSV,
  exportarNotasCSV,
} from "../controllers/turma.controller";

const router = Router();

router.use(authMiddleware);

// Rotas gerais
router.get("/", listarTurmas);
router.post("/", criarTurma);

// Rotas específicas (devem vir antes das rotas com :id genérico)
router.post("/:idTurma/importar-alunos", importarAlunosCSV);
router.get("/:idTurma/exportar-notas", exportarNotasCSV);

// Rotas com parâmetro :id
router.get("/:id", buscarTurmaPorId);
router.put("/:id", editarTurma);
router.delete("/:id", excluirTurma);

export default router;
