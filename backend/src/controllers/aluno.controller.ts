import { Request, Response } from "express";
import { alunoService } from "../services/aluno.service";

// ✅ Listar todos os alunos
export const listarAlunos = async (req: Request, res: Response) => {
  try {
    const alunos = await alunoService.findAll();
    return res.json(alunos);
  } catch (error) {
    console.error("Erro ao listar alunos:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Criar aluno
export const criarAluno = async (req: Request, res: Response) => {
  try {
    const { nome, ra } = req.body;

    if (!nome || !ra) {
      return res.status(400).json({ message: "Nome e RA são obrigatórios" });
    }

    // Verificar se RA já existe
    const existeRA = await alunoService.findByRA(ra);
    if (existeRA) {
      return res.status(400).json({ message: "RA já cadastrado" });
    }

    const id = await alunoService.create(nome, ra);
    const novo = await alunoService.findById(id);

    return res.status(201).json({ message: "Aluno criado", aluno: novo });
  } catch (error) {
    console.error("Erro ao criar aluno:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Editar aluno
export const editarAluno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, ra } = req.body;

    const existe = await alunoService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Aluno não encontrado" });
    }

    // Se estiver alterando o RA, verificar se já existe
    if (ra && ra !== existe.ra) {
      const existeRA = await alunoService.findByRA(ra);
      if (existeRA) {
        return res.status(400).json({ message: "RA já utilizado por outro aluno" });
      }
    }

    const atualizado = await alunoService.update(
      Number(id),
      nome,
      ra
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar aluno" });
    }

    const aluno = await alunoService.findById(Number(id));
    return res.json({ message: "Aluno atualizado", aluno });
  } catch (error) {
    console.error("Erro ao editar aluno:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Excluir aluno
export const excluirAluno = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await alunoService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Aluno não encontrado" });
    }

    const deletado = await alunoService.delete(Number(id));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir aluno" });
    }

    return res.json({ message: "Aluno excluído" });
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
