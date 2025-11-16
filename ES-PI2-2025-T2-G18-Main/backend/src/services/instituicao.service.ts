import { query } from "../config/database";

export interface Instituicao {
  id?: number;
  nome: string;
}

export const instituicaoService = {
  // Listar todas as instituições
  findAll: async (): Promise<Instituicao[]> => {
    return await query<Instituicao[]>("SELECT * FROM instituicoes ORDER BY id");
  },

  // Buscar instituição por ID
  findById: async (id: number): Promise<Instituicao | null> => {
    const results = await query<Instituicao[]>(
      "SELECT * FROM instituicoes WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar nova instituição
  create: async (nome: string): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO instituicoes (nome) VALUES (?)",
      [nome]
    ) as any;
    return result.insertId;
  },

  // Atualizar instituição
  update: async (id: number, nome: string): Promise<boolean> => {
    const result = await query<any>(
      "UPDATE instituicoes SET nome = ? WHERE id = ?",
      [nome, id]
    ) as any;
    return result.affectedRows > 0;
  },

  // Excluir instituição
  delete: async (id: number): Promise<boolean> => {
    const result = await query<any>(
      "DELETE FROM instituicoes WHERE id = ?",
      [id]
    ) as any;
    return result.affectedRows > 0;
  },
};

