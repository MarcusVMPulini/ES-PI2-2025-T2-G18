import { Request, Response } from "express";
import { turmaService } from "../services/turma.service";
import { disciplinaService } from "../services/disciplina.service";

// ✅ Listar todas as turmas
export const listarTurmas = async (req: Request, res: Response) => {
  try {
    const turmas = await turmaService.findAll();
    return res.json(turmas);
  } catch (error) {
    console.error("Erro ao listar turmas:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Criar turma
export const criarTurma = async (req: Request, res: Response) => {
  try {
    const { nome, idDisciplina, ano, semestre } = req.body;

    if (!nome || !idDisciplina || !ano || !semestre) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    // Verificar se a disciplina existe
    const existeDisciplina = await disciplinaService.findById(Number(idDisciplina));
    if (!existeDisciplina) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    const id = await turmaService.create(
      nome,
      Number(idDisciplina),
      Number(ano),
      Number(semestre)
    );
    const nova = await turmaService.findById(id);

    return res.status(201).json({ message: "Turma criada", turma: nova });
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Editar turma
export const editarTurma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, idDisciplina, ano, semestre } = req.body;

    const existe = await turmaService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    // Se estiver alterando a disciplina, verificar se existe
    if (idDisciplina) {
      const existeDisciplina = await disciplinaService.findById(Number(idDisciplina));
      if (!existeDisciplina) {
        return res.status(404).json({ message: "Disciplina não encontrada" });
      }
    }

    const atualizado = await turmaService.update(
      Number(id),
      nome,
      idDisciplina ? Number(idDisciplina) : undefined,
      ano ? Number(ano) : undefined,
      semestre ? Number(semestre) : undefined
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar turma" });
    }

    const turma = await turmaService.findById(Number(id));
    return res.json({ message: "Turma atualizada", turma });
  } catch (error) {
    console.error("Erro ao editar turma:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Excluir turma
export const excluirTurma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await turmaService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    const deletado = await turmaService.delete(Number(id));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir turma" });
    }

    return res.json({ message: "Turma excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
