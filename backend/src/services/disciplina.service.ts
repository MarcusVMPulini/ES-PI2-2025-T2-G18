import { query } from "../config/database";

export interface Disciplina {
  id?: number;
  nome: string;
  idCurso: number;
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
  create: async (nome: string, idCurso: number): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO disciplinas (nome, idCurso) VALUES (?, ?)",
      [nome, idCurso]
    ) as any;
    return result.insertId;
  },

  // Atualizar disciplina
  update: async (id: number, nome?: string, idCurso?: number): Promise<boolean> => {
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
};

