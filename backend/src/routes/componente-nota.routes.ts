import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarComponentesPorDisciplina,
  criarComponente,
  editarComponente,
  excluirComponente,
} from "../controllers/componente-nota.controller";

const router = Router();

router.use(authMiddleware);

// Rotas específicas primeiro
router.get("/disciplina/:idDisciplina", listarComponentesPorDisciplina);
router.post("/disciplina/:idDisciplina", criarComponente);

// Rotas gerais
router.put("/:id", editarComponente);
router.delete("/:id", excluirComponente);

export default router;

