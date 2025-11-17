//Autores: Marcus, Arthur

import { Request, Response } from "express";
import { notasService } from "../services/notas.service";
import { alunoService } from "../services/aluno.service";
import { turmaService } from "../services/turma.service";

// Listar todas as notas
export const listarNotas = async (req: Request, res: Response) => {
  try {
    const notas = await notasService.findAll();
    return res.json(notas);
  } catch (error) {
    console.error("Erro ao listar notas:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Lançar nota
export const lancarNota = async (req: Request, res: Response) => {
  try {
    const { idAluno, idTurma, nota1, nota2 } = req.body;

    if (!idAluno || !idTurma || nota1 === undefined || nota2 === undefined) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
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

    const id = await notasService.create(
      Number(idAluno),
      Number(idTurma),
      Number(nota1),
      Number(nota2)
    );
    const nova = await notasService.findById(id);

    return res.status(201).json({ message: "Notas lançadas", nota: nova });
  } catch (error) {
    console.error("Erro ao lançar nota:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Editar nota
export const editarNota = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nota1, nota2 } = req.body;

    const existe = await notasService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Registro não encontrado" });
    }

    const atualizado = await notasService.update(
      Number(id),
      nota1 !== undefined ? Number(nota1) : undefined,
      nota2 !== undefined ? Number(nota2) : undefined
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar nota" });
    }

    const nota = await notasService.findById(Number(id));
    return res.json({ message: "Nota atualizada", nota });
  } catch (error) {
    console.error("Erro ao editar nota:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Excluir nota
export const excluirNota = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await notasService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Registro não encontrado" });
    }

    const deletado = await notasService.delete(Number(id));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir nota" });
    }

    return res.json({ message: "Nota excluída" });
  } catch (error) {
    console.error("Erro ao excluir nota:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
