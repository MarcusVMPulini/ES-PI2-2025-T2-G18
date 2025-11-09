import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarDisciplinas,
  criarDisciplina,
  editarDisciplina,
  excluirDisciplina,
} from "../controllers/disciplina.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listarDisciplinas);
router.post("/", criarDisciplina);
router.put("/:id", editarDisciplina);
router.delete("/:id", excluirDisciplina);

export default router;
