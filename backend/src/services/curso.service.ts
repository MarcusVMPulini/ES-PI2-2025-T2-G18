import { query } from "../config/database";

export interface Curso {
  id?: number;
  nomeCurso: string;
  idInstituicao: number;
}

export const cursoService = {
  // Listar todos os cursos
  findAll: async (): Promise<Curso[]> => {
    return await query<Curso[]>("SELECT * FROM cursos ORDER BY id");
  },

  // Buscar curso por ID
  findById: async (id: number): Promise<Curso | null> => {
    const results = await query<Curso[]>(
      "SELECT * FROM cursos WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar novo curso
  create: async (nomeCurso: string, idInstituicao: number): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO cursos (nomeCurso, idInstituicao) VALUES (?, ?)",
      [nomeCurso, idInstituicao]
    ) as any;
    return result.insertId;
  },

  // Atualizar curso
  update: async (id: number, nomeCurso?: string, idInstituicao?: number): Promise<boolean> => {
    const updates: string[] = [];
    const params: any[] = [];

    if (nomeCurso !== undefined) {
      updates.push("nomeCurso = ?");
      params.push(nomeCurso);
    }
    if (idInstituicao !== undefined) {
      updates.push("idInstituicao = ?");
      params.push(idInstituicao);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const result = await query<any>(
      `UPDATE cursos SET ${updates.join(", ")} WHERE id = ?`,
      params
    ) as any;
    return result.affectedRows > 0;
  },

  // Excluir curso
  delete: async (id: number): Promise<boolean> => {
    const result = await query<any>(
      "DELETE FROM cursos WHERE id = ?",
      [id]
    ) as any;
    return result.affectedRows > 0;
  },

  // Listar cursos por instituição (por ID)
  findByInstituicao: async (idInstituicao: number): Promise<Curso[]> => {
    return await query<Curso[]>(
      "SELECT * FROM cursos WHERE idInstituicao = ? ORDER BY nomeCurso",
      [idInstituicao]
    );
  },
};

