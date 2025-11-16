import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarInstituicoes,
  listarCursosPorInstituicao,
} from "../controllers/instituicao.controller";

const router = Router();

// Todas as rotas de instituição exigem login (token)
router.use(authMiddleware);

// Rota específica deve vir antes da rota com parâmetro
router.get("/:nomeInstituicao/cursos", listarCursosPorInstituicao);
router.get("/", listarInstituicoes);

export default router;
