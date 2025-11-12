import { Request, Response } from "express";
import { cursoService } from "../services/curso.service";
import { instituicaoService } from "../services/instituicao.service";

// ✅ Listar todos os cursos
export const listarCursos = async (req: Request, res: Response) => {
  try {
    const cursos = await cursoService.findAll();
    return res.json(cursos);
  } catch (error) {
    console.error("Erro ao listar cursos:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Criar curso
export const criarCurso = async (req: Request, res: Response) => {
  try {
    const { nome, idInstituicao } = req.body;

    if (!nome || !idInstituicao) {
      return res.status(400).json({ message: "Nome e idInstituicao são obrigatórios" });
    }

    const existeInstituicao = await instituicaoService.findById(Number(idInstituicao));
    if (!existeInstituicao) {
      return res.status(404).json({ message: "Instituição não encontrada" });
    }

    const id = await cursoService.create(nome, Number(idInstituicao));
    const novo = await cursoService.findById(id);

    return res.status(201).json({ message: "Curso criado", curso: novo });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Editar curso
export const editarCurso = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, idInstituicao } = req.body;

    const existe = await cursoService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }

    if (idInstituicao) {
      const existeInstituicao = await instituicaoService.findById(Number(idInstituicao));
      if (!existeInstituicao) {
        return res.status(404).json({ message: "Instituição não encontrada" });
      }
    }

    const atualizado = await cursoService.update(
      Number(id),
      nome,
      idInstituicao ? Number(idInstituicao) : undefined
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar curso" });
    }

    const curso = await cursoService.findById(Number(id));
    return res.json({ message: "Curso atualizado", curso });
  } catch (error) {
    console.error("Erro ao editar curso:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Excluir curso
export const excluirCurso = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await cursoService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }

    const deletado = await cursoService.delete(Number(id));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir curso" });
    }

    return res.json({ message: "Curso excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
