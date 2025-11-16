import { query } from "../config/database";

export interface Curso {
  id?: number;
  nomeCurso: string;
  idInstituicao: number;
}

export const cursoService = {
  // Listar todos os cursos das instituições do usuário
  findAll: async (idUsuario: number): Promise<Curso[]> => {
    return await query<Curso[]>(
      `SELECT c.* FROM cursos c 
       INNER JOIN instituicoes i ON c.idInstituicao = i.id 
       WHERE i.idUsuario = ? 
       ORDER BY c.id`,
      [idUsuario]
    );
  },

  // Buscar curso por ID (verificando se pertence a uma instituição do usuário)
  findById: async (id: number, idUsuario: number): Promise<Curso | null> => {
    const results = await query<Curso[]>(
      `SELECT c.* FROM cursos c 
       INNER JOIN instituicoes i ON c.idInstituicao = i.id 
       WHERE c.id = ? AND i.idUsuario = ?`,
      [id, idUsuario]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar novo curso (verificando se a instituição pertence ao usuário)
  create: async (nomeCurso: string, idInstituicao: number, idUsuario: number): Promise<number> => {
    // Verificar se a instituição pertence ao usuário
    const instituicao = await query<any>(
      "SELECT id FROM instituicoes WHERE id = ? AND idUsuario = ?",
      [idInstituicao, idUsuario]
    );
    
    if (!instituicao || instituicao.length === 0) {
      throw new Error("Instituição não encontrada ou não pertence ao usuário");
    }

    const result = await query<any>(
      "INSERT INTO cursos (nomeCurso, idInstituicao) VALUES (?, ?)",
      [nomeCurso, idInstituicao]
    ) as any;
    return result.insertId;
  },

  // Atualizar curso (verificando se pertence a uma instituição do usuário)
  update: async (id: number, nomeCurso: string | undefined, idInstituicao: number | undefined, idUsuario: number): Promise<boolean> => {
    // Verificar se o curso pertence a uma instituição do usuário
    const cursoResults = await query<Curso[]>(
      `SELECT c.* FROM cursos c 
       INNER JOIN instituicoes i ON c.idInstituicao = i.id 
       WHERE c.id = ? AND i.idUsuario = ?`,
      [id, idUsuario]
    );
    if (!cursoResults || cursoResults.length === 0) {
      return false;
    }
    const curso = cursoResults[0];

    // Se estiver mudando a instituição, verificar se a nova pertence ao usuário
    if (idInstituicao !== undefined && idInstituicao !== curso.idInstituicao) {
      const instituicao = await query<any>(
        "SELECT id FROM instituicoes WHERE id = ? AND idUsuario = ?",
        [idInstituicao, idUsuario]
      );
      if (!instituicao || instituicao.length === 0) {
        return false;
      }
    }

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

  // Excluir curso (verificando se pertence a uma instituição do usuário)
  delete: async (id: number, idUsuario: number): Promise<boolean> => {
    // Verificar se o curso pertence a uma instituição do usuário
    const cursoResults = await query<Curso[]>(
      `SELECT c.* FROM cursos c 
       INNER JOIN instituicoes i ON c.idInstituicao = i.id 
       WHERE c.id = ? AND i.idUsuario = ?`,
      [id, idUsuario]
    );
    if (!cursoResults || cursoResults.length === 0) {
      return false;
    }

    const result = await query<any>(
      "DELETE FROM cursos WHERE id = ?",
      [id]
    ) as any;
    return result.affectedRows > 0;
  },

  // Listar cursos por instituição (verificando se a instituição pertence ao usuário)
  findByInstituicao: async (idInstituicao: number, idUsuario: number): Promise<Curso[]> => {
    return await query<Curso[]>(
      `SELECT c.* FROM cursos c 
       INNER JOIN instituicoes i ON c.idInstituicao = i.id 
       WHERE c.idInstituicao = ? AND i.idUsuario = ? 
       ORDER BY c.nomeCurso`,
      [idInstituicao, idUsuario]
    );
  },
};

