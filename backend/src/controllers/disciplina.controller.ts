import { Request, Response } from "express";
import { disciplinaService } from "../services/disciplina.service";
import { cursoService } from "../services/curso.service";
import { query } from "../config/database";

// ✅ Listar disciplinas dos cursos do usuário
export const listarDisciplinas = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const disciplinas = await disciplinaService.findAll(user.id);
    return res.json(disciplinas);
  } catch (error) {
    console.error("Erro ao listar disciplinas:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Buscar disciplina por ID (verificando se pertence ao usuário)
export const buscarDisciplinaPorId = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { id } = req.params;
    const disciplina = await disciplinaService.findById(Number(id), user.id);
    
    if (!disciplina) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }
    
    return res.json(disciplina);
  } catch (error) {
    console.error("Erro ao buscar disciplina:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Criar disciplina (verificando se o curso pertence ao usuário)
export const criarDisciplina = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { nome, idCurso, sigla, codigo, periodo } = req.body;

    if (!nome || !idCurso) {
      return res.status(400).json({ message: "Nome e idCurso são obrigatórios" });
    }

    const existeCurso = await cursoService.findById(Number(idCurso), user.id);
    if (!existeCurso) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }

    const id = await disciplinaService.create(
      nome,
      Number(idCurso),
      user.id,
      sigla,
      codigo,
      periodo
    );
    const nova = await disciplinaService.findById(id, user.id);

    if (!nova) {
      return res.status(404).json({ message: "Disciplina não encontrada após criação" });
    }

    return res.status(201).json({ message: "Disciplina criada", disciplina: nova });
  } catch (error: any) {
    console.error("Erro ao criar disciplina:", error);
    if (error.message && error.message.includes("não pertence ao usuário")) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Editar disciplina (verificando se pertence ao usuário)
export const editarDisciplina = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { id } = req.params;
    const { nome, idCurso, sigla, codigo, periodo, formula_nota_final } = req.body;

    const existe = await disciplinaService.findById(Number(id), user.id);
    if (!existe) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    if (idCurso) {
      const existeCurso = await cursoService.findById(Number(idCurso), user.id);
      if (!existeCurso) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
    }

    const atualizado = await disciplinaService.update(
      Number(id),
      user.id,
      nome,
      idCurso ? Number(idCurso) : undefined,
      sigla,
      codigo,
      periodo,
      formula_nota_final
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar disciplina" });
    }

    const disciplina = await disciplinaService.findById(Number(id), user.id);
    return res.json({
      message: "Disciplina atualizada",
      disciplina,
    });
  } catch (error) {
    console.error("Erro ao editar disciplina:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Excluir disciplina (verificando se pertence ao usuário)
export const excluirDisciplina = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { id } = req.params;

    const existe = await disciplinaService.findById(Number(id), user.id);
    if (!existe) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    // Verificar dependências
    const dependencias = await disciplinaService.hasDependencies(Number(id));
    if (dependencias.hasTurmas || dependencias.hasComponentes) {
      const mensagens: string[] = [];
      if (dependencias.hasTurmas) mensagens.push("turmas");
      if (dependencias.hasComponentes) mensagens.push("componentes de nota");
      return res.status(400).json({
        message: `Não é possível excluir a disciplina. Existem ${mensagens.join(" e ")} associadas. Exclua-as primeiro.`,
      });
    }

    const deletado = await disciplinaService.delete(Number(id), user.id);
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir disciplina" });
    }

    return res.json({ message: "Disciplina excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir disciplina:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Definir fórmula de nota final (verificando se pertence ao usuário)
export const definirFormulaNotaFinal = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const { id } = req.params;
    const { formula_nota_final } = req.body;

    const existe = await disciplinaService.findById(Number(id), user.id);
    if (!existe) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    // Validar fórmula (verificar se todos os componentes estão sendo usados)
    if (formula_nota_final) {
      const componentes = await query<any[]>(
        "SELECT sigla FROM componentes_nota WHERE idDisciplina = ?",
        [id]
      );

      // Extrair siglas da fórmula
      const siglasNaFormula = formula_nota_final.match(/\b[A-Z0-9]+\b/g) || [];
      const siglasComponentes = componentes.map((c) => c.sigla);

      // Verificar se todas as siglas dos componentes estão na fórmula
      const siglasFaltando = siglasComponentes.filter(
        (sigla) => !siglasNaFormula.includes(sigla)
      );

      if (siglasFaltando.length > 0) {
        return res.status(400).json({
          message: `A fórmula deve incluir todos os componentes cadastrados. Faltando: ${siglasFaltando.join(", ")}`,
        });
      }
    }

    const atualizado = await disciplinaService.update(
      Number(id),
      user.id,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      formula_nota_final
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar fórmula" });
    }

    const disciplina = await disciplinaService.findById(Number(id), user.id);
    return res.json({
      message: "Fórmula de nota final definida",
      disciplina,
    });
  } catch (error) {
    console.error("Erro ao definir fórmula:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
