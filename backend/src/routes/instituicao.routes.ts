import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarInstituicoes,
  buscarInstituicaoPorId,
  criarInstituicao,
  editarInstituicao,
  excluirInstituicao,
  listarCursosPorInstituicao,
} from "../controllers/instituicao.controller";

const router = Router();

// Todas as rotas de instituição exigem login (token)
router.use(authMiddleware);

// Rotas de instituição (rotas específicas primeiro)
router.get("/", listarInstituicoes);
router.post("/", criarInstituicao);
router.get("/:idInstituicao/cursos", listarCursosPorInstituicao);
router.get("/:id", buscarInstituicaoPorId);
router.put("/:id", editarInstituicao);
router.delete("/:id", excluirInstituicao);

export default router;
