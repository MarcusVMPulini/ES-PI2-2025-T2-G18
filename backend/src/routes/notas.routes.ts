//Autor: Marcus

//imports
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarNotas,
  lancarNota,
  editarNota,
  excluirNota
} from "../controllers/notas.controller";
//variavel manipulacao rota
const router = Router();
//rotas
router.use(authMiddleware);

router.get("/", listarNotas);
router.post("/", lancarNota);
router.put("/:id", editarNota);
router.delete("/:id", excluirNota);

export default router;
