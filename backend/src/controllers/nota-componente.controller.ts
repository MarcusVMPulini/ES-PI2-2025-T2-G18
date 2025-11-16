import { Request, Response } from "express";
import { notaComponenteService } from "../services/nota-componente.service";
import { alunoService } from "../services/aluno.service";
import { turmaService } from "../services/turma.service";
import { componenteNotaService } from "../services/componente-nota.service";

// ✅ Listar todas as notas de uma turma
export const listarNotasPorTurma = async (req: Request, res: Response) => {
  try {
    const { idTurma } = req.params;
    const notas = await notaComponenteService.findByTurma(Number(idTurma));
    return res.json(notas);
  } catch (error) {
    console.error("Erro ao listar notas:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Listar notas de um componente específico em uma turma
export const listarNotasPorComponente = async (req: Request, res: Response) => {
  try {
    const { idTurma, idComponente } = req.params;
    const notas = await notaComponenteService.findByTurmaAndComponente(
      Number(idTurma),
      Number(idComponente)
    );
    return res.json(notas);
  } catch (error) {
    console.error("Erro ao listar notas do componente:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Lançar/Editar nota de um componente específico
export const lancarNotaComponente = async (req: Request, res: Response) => {
  try {
    const { idTurma, idComponente } = req.params;
    const { idAluno, valor } = req.body;

    if (!idAluno || valor === undefined) {
      return res.status(400).json({ message: "idAluno e valor são obrigatórios" });
    }

    // Validar valor
    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum < 0 || valorNum > 10) {
      return res.status(400).json({ message: "O valor da nota deve estar entre 0.00 e 10.00" });
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

    // Verificar se componente existe
    const componente = await componenteNotaService.findById(Number(idComponente));
    if (!componente) {
      return res.status(404).json({ message: "Componente não encontrado" });
    }

    // Verificar se componente pertence à disciplina da turma
    if (componente.idDisciplina !== turma.idDisciplina) {
      return res.status(400).json({
        message: "O componente não pertence à disciplina desta turma",
      });
    }

    const id = await notaComponenteService.upsert(
      Number(idAluno),
      Number(idTurma),
      Number(idComponente),
      valorNum
    );

    const nota = await notaComponenteService.findById(id);
    return res.status(200).json({ message: "Nota lançada/atualizada", nota });
  } catch (error: any) {
    console.error("Erro ao lançar nota:", error);
    if (error.message.includes("valor da nota")) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Editar nota específica
export const editarNota = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { valor } = req.body;

    if (valor === undefined) {
      return res.status(400).json({ message: "Valor é obrigatório" });
    }

    // Validar valor
    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum < 0 || valorNum > 10) {
      return res.status(400).json({ message: "O valor da nota deve estar entre 0.00 e 10.00" });
    }

    const existe = await notaComponenteService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    const atualizado = await notaComponenteService.update(Number(id), valorNum);
    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar nota" });
    }

    const nota = await notaComponenteService.findById(Number(id));
    return res.json({ message: "Nota atualizada", nota });
  } catch (error: any) {
    console.error("Erro ao editar nota:", error);
    if (error.message.includes("valor da nota")) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Calcular nota final de um aluno
export const calcularNotaFinal = async (req: Request, res: Response) => {
  try {
    const { idTurma, idAluno } = req.params;

    const resultado = await notaComponenteService.calcularNotaFinalAluno(
      Number(idAluno),
      Number(idTurma)
    );

    return res.json(resultado);
  } catch (error) {
    console.error("Erro ao calcular nota final:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Excluir nota
export const excluirNota = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await notaComponenteService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Nota não encontrada" });
    }

    const deletado = await notaComponenteService.delete(Number(id));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir nota" });
    }

    return res.json({ message: "Nota excluída" });
  } catch (error) {
    console.error("Erro ao excluir nota:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

