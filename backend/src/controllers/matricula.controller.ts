import { Request, Response } from "express";
import { matriculaService } from "../services/matricula.service";
import { alunoService } from "../services/aluno.service";
import { turmaService } from "../services/turma.service";

// ✅ Listar todas as matrículas
export const listarMatriculas = async (req: Request, res: Response) => {
  try {
    const matriculas = await matriculaService.findAll();
    return res.json(matriculas);
  } catch (error) {
    console.error("Erro ao listar matrículas:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Matricular aluno
export const matricularAluno = async (req: Request, res: Response) => {
  try {
    const { idAluno, idTurma } = req.body;

    if (!idAluno || !idTurma) {
      return res.status(400).json({ message: "idAluno e idTurma são obrigatórios" });
    }

    // Verificar se aluno existe
    const aluno = await alunoService.findById(Number(idAluno));
    if (!aluno) {
      return res.status(404).json({ message: "Aluno não encontrado" });
    }

    // Verificar se turma existe
    const turma = await turmaService.findById(Number(idTurma));
    if (!turma) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    // Verificar se já está matriculado
    const existe = await matriculaService.findByAlunoAndTurma(
      Number(idAluno),
      Number(idTurma)
    );
    if (existe) {
      return res.status(400).json({ message: "Aluno já matriculado nessa turma" });
    }

    const id = await matriculaService.create(Number(idAluno), Number(idTurma));
    const nova = await matriculaService.findById(id);

    return res.status(201).json({ message: "Aluno matriculado com sucesso", matricula: nova });
  } catch (error) {
    console.error("Erro ao matricular aluno:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Remover matrícula
export const removerMatricula = async (req: Request, res: Response) => {
  try {
    const { idAluno, idTurma } = req.params;

    // Verificar se matrícula existe
    const existe = await matriculaService.findByAlunoAndTurma(
      Number(idAluno),
      Number(idTurma)
    );
    if (!existe) {
      return res.status(404).json({ message: "Matrícula não encontrada" });
    }

    const deletado = await matriculaService.delete(Number(idAluno), Number(idTurma));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao remover matrícula" });
    }

    return res.json({ message: "Matrícula removida" });
  } catch (error) {
    console.error("Erro ao remover matrícula:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
