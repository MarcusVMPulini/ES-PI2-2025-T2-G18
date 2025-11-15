import { query } from "../config/database";

export interface Aluno {
  id?: number;
  nome: string;
  ra: string;
}

export const alunoService = {
  // Listar todos os alunos
  findAll: async (): Promise<Aluno[]> => {
    return await query<Aluno[]>("SELECT * FROM alunos ORDER BY id");
  },

  // Buscar aluno por ID
  findById: async (id: number): Promise<Aluno | null> => {
    const results = await query<Aluno[]>(
      "SELECT * FROM alunos WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Buscar aluno por RA
  findByRA: async (ra: string): Promise<Aluno | null> => {
    const results = await query<Aluno[]>(
      "SELECT * FROM alunos WHERE ra = ?",
      [ra]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar novo aluno
  create: async (nome: string, ra: string): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO alunos (nome, ra) VALUES (?, ?)",
      [nome, ra]
    ) as any;
    return result.insertId;
  },

  // Atualizar aluno
  update: async (id: number, nome?: string, ra?: string): Promise<boolean> => {
    const updates: string[] = [];
    const params: any[] = [];

    if (nome !== undefined) {
      updates.push("nome = ?");
      params.push(nome);
    }
    if (ra !== undefined) {
      updates.push("ra = ?");
      params.push(ra);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const result = await query<any>(
      `UPDATE alunos SET ${updates.join(", ")} WHERE id = ?`,
      params
    ) as any;
    return result.affectedRows > 0;
  },

  // Excluir aluno
  delete: async (id: number): Promise<boolean> => {
    const result = await query<any>(
      "DELETE FROM alunos WHERE id = ?",
      [id]
    ) as any;
    return result.affectedRows > 0;
  },
};

