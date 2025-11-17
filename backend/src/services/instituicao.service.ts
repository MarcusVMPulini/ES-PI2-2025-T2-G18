//Autores: Marcus, Leonel

import { query } from "../config/database";

export interface Instituicao {
  id?: number;
  nome: string;
  idUsuario?: number;
}

export const instituicaoService = {
  // Listar todas as instituições do usuário
  findAll: async (idUsuario: number): Promise<Instituicao[]> => {
    return await query<Instituicao[]>(
      "SELECT * FROM instituicoes WHERE idUsuario = ? ORDER BY id",
      [idUsuario]
    );
  },

  // Buscar instituição por ID (verificando se pertence ao usuário)
  findById: async (id: number, idUsuario: number): Promise<Instituicao | null> => {
    const results = await query<Instituicao[]>(
      "SELECT * FROM instituicoes WHERE id = ? AND idUsuario = ?",
      [id, idUsuario]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar nova instituição associada ao usuário
  create: async (nome: string, idUsuario: number): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO instituicoes (nome, idUsuario) VALUES (?, ?)",
      [nome, idUsuario]
    ) as any;
    return result.insertId;
  },

  // Atualizar instituição (verificando se pertence ao usuário)
  update: async (id: number, nome: string, idUsuario: number): Promise<boolean> => {
    const result = await query<any>(
      "UPDATE instituicoes SET nome = ? WHERE id = ? AND idUsuario = ?",
      [nome, id, idUsuario]
    ) as any;
    return result.affectedRows > 0;
  },

  // Excluir instituição (verificando se pertence ao usuário)
  delete: async (id: number, idUsuario: number): Promise<boolean> => {
    const result = await query<any>(
      "DELETE FROM instituicoes WHERE id = ? AND idUsuario = ?",
      [id, idUsuario]
    ) as any;
    return result.affectedRows > 0;
  },
};

