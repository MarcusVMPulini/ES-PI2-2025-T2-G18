//Autores: Marcus, Leonel

import { query } from "../config/database";

export interface Disciplina {
  id?: number;
  nome: string;
  idCurso: number;
  sigla?: string;
  codigo?: string;
  periodo?: string;
  formula_nota_final?: string;
}

export const disciplinaService = {
  // Listar todas as disciplinas dos cursos do usuário
  findAll: async (idUsuario: number): Promise<Disciplina[]> => {
    return await query<Disciplina[]>(
      `SELECT d.* FROM disciplinas d
       INNER JOIN cursos c ON d.idCurso = c.id
       INNER JOIN instituicoes i ON c.idInstituicao = i.id
       WHERE i.idUsuario = ?
       ORDER BY d.id`,
      [idUsuario]
    );
  },

  // Buscar disciplina por ID (verificando se pertence a um curso do usuário)
  findById: async (id: number, idUsuario: number): Promise<Disciplina | null> => {
    const results = await query<Disciplina[]>(
      `SELECT d.* FROM disciplinas d
       INNER JOIN cursos c ON d.idCurso = c.id
       INNER JOIN instituicoes i ON c.idInstituicao = i.id
       WHERE d.id = ? AND i.idUsuario = ?`,
      [id, idUsuario]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar nova disciplina (verificando se o curso pertence ao usuário)
  create: async (
    nome: string,
    idCurso: number,
    idUsuario: number,
    sigla?: string,
    codigo?: string,
    periodo?: string
  ): Promise<number> => {
    // Verificar se o curso pertence a uma instituição do usuário
    const curso = await query<any>(
      `SELECT c.id FROM cursos c
       INNER JOIN instituicoes i ON c.idInstituicao = i.id
       WHERE c.id = ? AND i.idUsuario = ?`,
      [idCurso, idUsuario]
    );
    
    if (!curso || curso.length === 0) {
      throw new Error("Curso não encontrado ou não pertence ao usuário");
    }

    const result = await query<any>(
      "INSERT INTO disciplinas (nome, idCurso, sigla, codigo, periodo) VALUES (?, ?, ?, ?, ?)",
      [nome, idCurso, sigla || null, codigo || null, periodo || null]
    ) as any;
    return result.insertId;
  },

  // Atualizar disciplina (verificando se pertence a um curso do usuário)
  update: async (
    id: number,
    idUsuario: number,
    nome?: string,
    idCurso?: number,
    sigla?: string,
    codigo?: string,
    periodo?: string,
    formula_nota_final?: string
  ): Promise<boolean> => {
    // Verificar se a disciplina pertence a um curso do usuário
    const disciplinaResults = await query<Disciplina[]>(
      `SELECT d.* FROM disciplinas d
       INNER JOIN cursos c ON d.idCurso = c.id
       INNER JOIN instituicoes i ON c.idInstituicao = i.id
       WHERE d.id = ? AND i.idUsuario = ?`,
      [id, idUsuario]
    );
    if (!disciplinaResults || disciplinaResults.length === 0) {
      return false;
    }
    const disciplina = disciplinaResults[0];

    // Se estiver mudando o curso, verificar se o novo pertence ao usuário
    if (idCurso !== undefined && idCurso !== disciplina.idCurso) {
      const curso = await query<any>(
        `SELECT c.id FROM cursos c
         INNER JOIN instituicoes i ON c.idInstituicao = i.id
         WHERE c.id = ? AND i.idUsuario = ?`,
        [idCurso, idUsuario]
      );
      if (!curso || curso.length === 0) {
        return false;
      }
    }
    const updates: string[] = [];
    const params: any[] = [];

    if (nome !== undefined) {
      updates.push("nome = ?");
      params.push(nome);
    }
    if (idCurso !== undefined) {
      updates.push("idCurso = ?");
      params.push(idCurso);
    }
    if (sigla !== undefined) {
      updates.push("sigla = ?");
      params.push(sigla);
    }
    if (codigo !== undefined) {
      updates.push("codigo = ?");
      params.push(codigo);
    }
    if (periodo !== undefined) {
      updates.push("periodo = ?");
      params.push(periodo);
    }
    if (formula_nota_final !== undefined) {
      updates.push("formula_nota_final = ?");
      params.push(formula_nota_final);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const result = await query<any>(
      `UPDATE disciplinas SET ${updates.join(", ")} WHERE id = ?`,
      params
    ) as any;
    return result.affectedRows > 0;
  },

  // Excluir disciplina (verificando se pertence a um curso do usuário)
  delete: async (id: number, idUsuario: number): Promise<boolean> => {
    // Verificar se a disciplina pertence a um curso do usuário
    const disciplinaResults = await query<Disciplina[]>(
      `SELECT d.* FROM disciplinas d
       INNER JOIN cursos c ON d.idCurso = c.id
       INNER JOIN instituicoes i ON c.idInstituicao = i.id
       WHERE d.id = ? AND i.idUsuario = ?`,
      [id, idUsuario]
    );
    if (!disciplinaResults || disciplinaResults.length === 0) {
      return false;
    }

    const result = await query<any>(
      "DELETE FROM disciplinas WHERE id = ?",
      [id]
    ) as any;
    return result.affectedRows > 0;
  },

  // Verificar se disciplina tem dependências (turmas, componentes)
  hasDependencies: async (id: number): Promise<{ hasTurmas: boolean; hasComponentes: boolean }> => {
    const turmas = await query<any[]>(
      "SELECT COUNT(*) as count FROM turmas WHERE idDisciplina = ?",
      [id]
    );
    const componentes = await query<any[]>(
      "SELECT COUNT(*) as count FROM componentes_nota WHERE idDisciplina = ?",
      [id]
    );
    return {
      hasTurmas: turmas[0]?.count > 0,
      hasComponentes: componentes[0]?.count > 0,
    };
  },
};

