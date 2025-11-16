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
  // Listar todas as disciplinas
  findAll: async (): Promise<Disciplina[]> => {
    return await query<Disciplina[]>("SELECT * FROM disciplinas ORDER BY id");
  },

  // Buscar disciplina por ID
  findById: async (id: number): Promise<Disciplina | null> => {
    const results = await query<Disciplina[]>(
      "SELECT * FROM disciplinas WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar nova disciplina
  create: async (
    nome: string,
    idCurso: number,
    sigla?: string,
    codigo?: string,
    periodo?: string
  ): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO disciplinas (nome, idCurso, sigla, codigo, periodo) VALUES (?, ?, ?, ?, ?)",
      [nome, idCurso, sigla || null, codigo || null, periodo || null]
    ) as any;
    return result.insertId;
  },

  // Atualizar disciplina
  update: async (
    id: number,
    nome?: string,
    idCurso?: number,
    sigla?: string,
    codigo?: string,
    periodo?: string,
    formula_nota_final?: string
  ): Promise<boolean> => {
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

  // Excluir disciplina
  delete: async (id: number): Promise<boolean> => {
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

