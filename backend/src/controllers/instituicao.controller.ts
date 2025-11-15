import { Request, Response } from "express";
import { instituicaoService } from "../services/instituicao.service";
import { cursoService } from "../services/curso.service";

// Listar todas as instituições
export const listarInstituicoes = async (req: Request, res: Response) => {
  try {
    const instituicoes = await instituicaoService.findAll();
    return res.json(instituicoes);
  } catch (error) {
    console.error("Erro ao listar instituições:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Buscar instituição por ID
export const buscarInstituicaoPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const instituicao = await instituicaoService.findById(Number(id));
    
    if (!instituicao) {
      return res.status(404).json({ message: "Instituição não encontrada" });
    }
    
    return res.json(instituicao);
  } catch (error) {
    console.error("Erro ao buscar instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Criar instituição
export const criarInstituicao = async (req: Request, res: Response) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const id = await instituicaoService.create(nome);
    const nova = await instituicaoService.findById(id);

    return res.status(201).json({ message: "Instituição criada", instituicao: nova });
  } catch (error) {
    console.error("Erro ao criar instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Editar instituição
export const editarInstituicao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const existe = await instituicaoService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Instituição não encontrada" });
    }

    const atualizado = await instituicaoService.update(Number(id), nome);

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar instituição" });
    }

    const instituicao = await instituicaoService.findById(Number(id));
    return res.json({ message: "Instituição atualizada", instituicao });
  } catch (error) {
    console.error("Erro ao editar instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Excluir instituição
export const excluirInstituicao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await instituicaoService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Instituição não encontrada" });
    }

    const deletado = await instituicaoService.delete(Number(id));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir instituição" });
    }

    return res.json({ message: "Instituição excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Listar cursos de uma instituição específica (por ID)
export const listarCursosPorInstituicao = async (req: Request, res: Response) => {
  try {
    const { idInstituicao } = req.params;
    const cursos = await cursoService.findByInstituicao(Number(idInstituicao));
    return res.json(cursos);
  } catch (error) {
    console.error("Erro ao listar cursos da instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
