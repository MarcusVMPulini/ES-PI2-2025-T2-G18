import { Request, Response } from "express";
import { cursoService } from "../services/curso.service";

// Listar todas as instituições únicas (agora vem da tabela de cursos)
export const listarInstituicoes = async (req: Request, res: Response) => {
  try {
    const instituicoes = await cursoService.findAllInstituicoes();
    return res.json(instituicoes.map(nome => ({ nome })));
  } catch (error) {
    console.error("Erro ao listar instituições:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Listar cursos de uma instituição específica
export const listarCursosPorInstituicao = async (req: Request, res: Response) => {
  try {
    const { nomeInstituicao } = req.params;
    const cursos = await cursoService.findByInstituicao(nomeInstituicao);
    return res.json(cursos);
  } catch (error) {
    console.error("Erro ao listar cursos da instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
