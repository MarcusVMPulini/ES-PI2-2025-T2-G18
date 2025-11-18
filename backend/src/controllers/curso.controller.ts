//Autores: Marcus, Leonel

import { Request, Response } from "express";
import { cursoService } from "../services/curso.service";

// ✅ Listar todos os cursos das instituições do usuário
export const listarCursos = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const cursos = await cursoService.findAll(user.id);
    return res.json(cursos);
  } catch (error) {
    console.error("Erro ao listar cursos:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Criar curso (verificando se a instituição pertence ao usuário)
export const criarCurso = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { nomeCurso, idInstituicao } = req.body;

    if (!nomeCurso || !idInstituicao) {
      return res.status(400).json({ message: "nomeCurso e idInstituicao são obrigatórios" });
    }

    const id = await cursoService.create(nomeCurso, Number(idInstituicao), user.id);
    const novo = await cursoService.findById(id, user.id);

    if (!novo) {
      return res.status(404).json({ message: "Curso não encontrado após criação" });
    }

    return res.status(201).json({ message: "Curso criado", curso: novo });
  } catch (error: any) {
    console.error("Erro ao criar curso:", error);
    if (error.message && error.message.includes("não pertence ao usuário")) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Editar curso (verificando se pertence a uma instituição do usuário)
export const editarCurso = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { id } = req.params;
    const { nomeCurso, idInstituicao } = req.body;

    const existe = await cursoService.findById(Number(id), user.id);
    if (!existe) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }

    const atualizado = await cursoService.update(
      Number(id),
      nomeCurso,
      idInstituicao ? Number(idInstituicao) : undefined,
      user.id
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar curso" });
    }

    const curso = await cursoService.findById(Number(id), user.id);
    return res.json({ message: "Curso atualizado", curso });
  } catch (error) {
    console.error("Erro ao editar curso:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Excluir curso (verificando se pertence a uma instituição do usuário)
export const excluirCurso = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { id } = req.params;

    const existe = await cursoService.findById(Number(id), user.id);
    if (!existe) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }

    const deletado = await cursoService.delete(Number(id), user.id);
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir curso" });
    }

    return res.json({ message: "Curso excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
