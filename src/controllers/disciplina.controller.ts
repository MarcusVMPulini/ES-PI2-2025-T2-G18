import { Request, Response } from "express";
import { disciplinaService } from "../services/disciplina.service";
import { cursoService } from "../services/curso.service";

// ✅ Listar
export const listarDisciplinas = async (req: Request, res: Response) => {
  try {
    const disciplinas = await disciplinaService.findAll();
    return res.json(disciplinas);
  } catch (error) {
    console.error("Erro ao listar disciplinas:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Criar
export const criarDisciplina = async (req: Request, res: Response) => {
  try {
    const { nome, idCurso } = req.body;

    if (!nome || !idCurso) {
      return res.status(400).json({ message: "Nome e idCurso são obrigatórios" });
    }

    const existeCurso = await cursoService.findById(Number(idCurso));
    if (!existeCurso) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }

    const id = await disciplinaService.create(nome, Number(idCurso));
    const nova = await disciplinaService.findById(id);

    return res.status(201).json({ message: "Disciplina criada", disciplina: nova });
  } catch (error) {
    console.error("Erro ao criar disciplina:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Editar
export const editarDisciplina = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, idCurso } = req.body;

    const existe = await disciplinaService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    if (idCurso) {
      const existeCurso = await cursoService.findById(Number(idCurso));
      if (!existeCurso) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
    }

    const atualizado = await disciplinaService.update(
      Number(id),
      nome,
      idCurso ? Number(idCurso) : undefined
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar disciplina" });
    }

    const disciplina = await disciplinaService.findById(Number(id));
    return res.json({
      message: "Disciplina atualizada",
      disciplina,
    });
  } catch (error) {
    console.error("Erro ao editar disciplina:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Excluir
export const excluirDisciplina = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await disciplinaService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    const deletado = await disciplinaService.delete(Number(id));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir disciplina" });
    }

    return res.json({ message: "Disciplina excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir disciplina:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
