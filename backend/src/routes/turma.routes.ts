import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarTurmas,
  criarTurma,
  editarTurma,
  excluirTurma,
} from "../controllers/turma.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listarTurmas);
router.post("/", criarTurma);
router.put("/:id", editarTurma);
router.delete("/:id", excluirTurma);

export default router;
