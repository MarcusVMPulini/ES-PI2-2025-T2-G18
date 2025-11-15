import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listarNotas,
  lancarNota,
  editarNota,
  excluirNota
} from "../controllers/notas.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listarNotas);
router.post("/", lancarNota);
router.put("/:id", editarNota);
router.delete("/:id", excluirNota);

export default router;
