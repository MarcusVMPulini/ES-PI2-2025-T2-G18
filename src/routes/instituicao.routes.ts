import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarInstituicoes,
  criarInstituicao,
  editarInstituicao,
  excluirInstituicao,
} from "../controllers/instituicao.controller";

const router = Router();

// Todas as rotas de instituição exigem login (token)
router.use(authMiddleware);

router.get("/", listarInstituicoes);
router.post("/", criarInstituicao);
router.put("/:id", editarInstituicao);
router.delete("/:id", excluirInstituicao);

export default router;
