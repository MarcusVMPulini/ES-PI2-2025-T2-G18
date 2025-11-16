import { Request, Response } from "express";
import { componenteNotaService } from "../services/componente-nota.service";
import { disciplinaService } from "../services/disciplina.service";

// ✅ Listar componentes de uma disciplina
export const listarComponentesPorDisciplina = async (req: Request, res: Response) => {
  try {
    const { idDisciplina } = req.params;
    const componentes = await componenteNotaService.findByDisciplina(Number(idDisciplina));
    return res.json(componentes);
  } catch (error) {
    console.error("Erro ao listar componentes:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Criar componente
export const criarComponente = async (req: Request, res: Response) => {
  try {
    const { idDisciplina } = req.params;
    const { nome, sigla, descricao } = req.body;

    if (!nome || !sigla) {
      return res.status(400).json({ message: "Nome e sigla são obrigatórios" });
    }

    // Verificar se disciplina existe
    const disciplina = await disciplinaService.findById(Number(idDisciplina));
    if (!disciplina) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    // Validar sigla (apenas letras e números, sem espaços)
    if (!/^[A-Za-z0-9]+$/.test(sigla)) {
      return res.status(400).json({ message: "A sigla deve conter apenas letras e números, sem espaços" });
    }

    const id = await componenteNotaService.create(
      nome,
      sigla.toUpperCase(),
      Number(idDisciplina),
      descricao
    );
    const novo = await componenteNotaService.findById(id);

    return res.status(201).json({ message: "Componente criado", componente: novo });
  } catch (error: any) {
    console.error("Erro ao criar componente:", error);
    if (error.message.includes("Já existe")) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Editar componente
export const editarComponente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, sigla, descricao } = req.body;

    const existe = await componenteNotaService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Componente não encontrado" });
    }

    // Validar sigla se fornecida
    if (sigla && !/^[A-Za-z0-9]+$/.test(sigla)) {
      return res.status(400).json({ message: "A sigla deve conter apenas letras e números, sem espaços" });
    }

    const atualizado = await componenteNotaService.update(
      Number(id),
      nome,
      sigla ? sigla.toUpperCase() : undefined,
      descricao
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar componente" });
    }

    const componente = await componenteNotaService.findById(Number(id));
    return res.json({ message: "Componente atualizado", componente });
  } catch (error: any) {
    console.error("Erro ao editar componente:", error);
    if (error.message.includes("Já existe")) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Excluir componente
export const excluirComponente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await componenteNotaService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Componente não encontrado" });
    }

    const deletado = await componenteNotaService.delete(Number(id));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir componente" });
    }

    return res.json({ message: "Componente excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir componente:", error);
    if (error.message.includes("Existem notas")) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

