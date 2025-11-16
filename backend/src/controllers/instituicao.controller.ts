import { Request, Response } from "express";
import { instituicaoService } from "../services/instituicao.service";
import { cursoService } from "../services/curso.service";

// Listar todas as instituições do usuário logado
export const listarInstituicoes = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const instituicoes = await instituicaoService.findAll(user.id);
    return res.json(instituicoes);
  } catch (error) {
    console.error("Erro ao listar instituições:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Buscar instituição por ID (verificando se pertence ao usuário)
export const buscarInstituicaoPorId = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { id } = req.params;
    const instituicao = await instituicaoService.findById(Number(id), user.id);
    
    if (!instituicao) {
      return res.status(404).json({ message: "Instituição não encontrada" });
    }
    
    return res.json(instituicao);
  } catch (error) {
    console.error("Erro ao buscar instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Criar instituição associada ao usuário logado
export const criarInstituicao = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const id = await instituicaoService.create(nome, user.id);
    const nova = await instituicaoService.findById(id, user.id);

    return res.status(201).json({ message: "Instituição criada", instituicao: nova });
  } catch (error) {
    console.error("Erro ao criar instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Editar instituição (verificando se pertence ao usuário)
export const editarInstituicao = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { id } = req.params;
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ message: "nome é obrigatório" });
    }

    const existe = await instituicaoService.findById(Number(id), user.id);
    if (!existe) {
      return res.status(404).json({ message: "Instituição não encontrada" });
    }

    const atualizado = await instituicaoService.update(Number(id), nome, user.id);

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar instituição" });
    }

    const instituicao = await instituicaoService.findById(Number(id), user.id);
    return res.json({ message: "Instituição atualizada", instituicao });
  } catch (error) {
    console.error("Erro ao editar instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Excluir instituição (verificando se pertence ao usuário)
export const excluirInstituicao = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { id } = req.params;

    const existe = await instituicaoService.findById(Number(id), user.id);
    if (!existe) {
      return res.status(404).json({ message: "Instituição não encontrada" });
    }

    const deletado = await instituicaoService.delete(Number(id), user.id);
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir instituição" });
    }

    return res.json({ message: "Instituição excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Listar cursos de uma instituição específica (verificando se a instituição pertence ao usuário)
export const listarCursosPorInstituicao = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { idInstituicao } = req.params;
    
    // Verificar se a instituição pertence ao usuário
    const instituicao = await instituicaoService.findById(Number(idInstituicao), user.id);
    if (!instituicao) {
      return res.status(404).json({ message: "Instituição não encontrada" });
    }

    const cursos = await cursoService.findByInstituicao(Number(idInstituicao), user.id);
    return res.json(cursos);
  } catch (error) {
    console.error("Erro ao listar cursos da instituição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
