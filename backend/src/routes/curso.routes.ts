//Autor: Marcus

//imports
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarCursos,
  criarCurso,
  editarCurso,
  excluirCurso,
} from "../controllers/curso.controller";
//variavel para manipulacao
const router = Router();
//rotas
router.use(authMiddleware);

router.get("/", listarCursos);
router.post("/", criarCurso);
router.put("/:id", editarCurso);
router.delete("/:id", excluirCurso);

export default router;
