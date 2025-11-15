import { Router } from "express";
import authRoutes from "./auth.routes";
import { authMiddleware } from "../middleware/auth.middleware";
import instituicaoRoutes from "./instituicao.routes";
import cursoRoutes from "./curso.routes";
import disciplinaRoutes from "./disciplina.routes";
import turmaRoutes from "./turma.routes";
import alunoRoutes from "./aluno.routes";
import matriculaRoutes from "./matricula.routes";
import notasRoutes from "./notas.routes";
import boletimRoutes from "./boletim.routes";

const router = Router();

router.get("/protegido", authMiddleware, (req, res) => {
    res.json({ message: "Acesso permitido ao usuário logado!" });
});

router.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

router.use("/auth", authRoutes);
router.use("/instituicoes", instituicaoRoutes);
router.use("/cursos", cursoRoutes);
router.use("/disciplinas", disciplinaRoutes);
router.use("/turmas", turmaRoutes);
router.use("/alunos", alunoRoutes);
router.use("/matriculas", matriculaRoutes);
router.use("/notas", notasRoutes);
router.use("/boletim", boletimRoutes);





export default router;

