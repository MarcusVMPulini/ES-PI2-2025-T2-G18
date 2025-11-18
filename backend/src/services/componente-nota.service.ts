//Autores: Marcus, Arthur

import { query } from "../config/database";

export interface ComponenteNota {
  id?: number;
  nome: string;
  sigla: string;
  descricao?: string;
  idDisciplina: number;
  peso?: number; // Percentual que o componente vale na nota final (0-100)
  created_at?: Date;
  updated_at?: Date;
}

export const componenteNotaService = {
  // Listar todos os componentes
  findAll: async (): Promise<ComponenteNota[]> => {
    return await query<ComponenteNota[]>("SELECT * FROM componentes_nota ORDER BY id");
  },

  // Buscar componente por ID
  findById: async (id: number): Promise<ComponenteNota | null> => {
    const results = await query<ComponenteNota[]>(
      "SELECT * FROM componentes_nota WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Buscar componentes por disciplina
  findByDisciplina: async (idDisciplina: number): Promise<ComponenteNota[]> => {
    return await query<ComponenteNota[]>(
      "SELECT * FROM componentes_nota WHERE idDisciplina = ? ORDER BY id",
      [idDisciplina]
    );
  },

  // Verificar se sigla já existe na disciplina
  findBySiglaAndDisciplina: async (
    sigla: string,
    idDisciplina: number
  ): Promise<ComponenteNota | null> => {
    const results = await query<ComponenteNota[]>(
      "SELECT * FROM componentes_nota WHERE sigla = ? AND idDisciplina = ?",
      [sigla, idDisciplina]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar novo componente
  create: async (
    nome: string,
    sigla: string,
    idDisciplina: number,
    descricao?: string,
    peso?: number
  ): Promise<number> => {
    // Validar sigla única na disciplina
    const existe = await componenteNotaService.findBySiglaAndDisciplina(sigla, idDisciplina);
    if (existe) {
      throw new Error("Já existe um componente com esta sigla nesta disciplina");
    }

    // Validar peso se fornecido
    if (peso !== undefined && (peso < 0 || peso > 100)) {
      throw new Error("O peso deve estar entre 0 e 100");
    }

    const result = await query<any>(
      "INSERT INTO componentes_nota (nome, sigla, descricao, idDisciplina, peso) VALUES (?, ?, ?, ?, ?)",
      [nome, sigla, descricao || null, idDisciplina, peso !== undefined ? peso : null]
    ) as any;
    return result.insertId;
  },

  // Atualizar componente
  update: async (
    id: number,
    nome?: string,
    sigla?: string,
    descricao?: string,
    peso?: number
  ): Promise<boolean> => {
    const updates: string[] = [];
    const params: any[] = [];

    if (nome !== undefined) {
      updates.push("nome = ?");
      params.push(nome);
    }
    if (sigla !== undefined) {
      // Verificar se a nova sigla já existe (exceto no próprio componente)
      const componente = await componenteNotaService.findById(id);
      if (componente) {
        const existe = await componenteNotaService.findBySiglaAndDisciplina(sigla, componente.idDisciplina);
        if (existe && existe.id !== id) {
          throw new Error("Já existe um componente com esta sigla nesta disciplina");
        }
      }
      updates.push("sigla = ?");
      params.push(sigla);
    }
    if (descricao !== undefined) {
      updates.push("descricao = ?");
      params.push(descricao);
    }
    if (peso !== undefined) {
      // Validar peso
      if (peso < 0 || peso > 100) {
        throw new Error("O peso deve estar entre 0 e 100");
      }
      updates.push("peso = ?");
      params.push(peso);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const result = await query<any>(
      `UPDATE componentes_nota SET ${updates.join(", ")} WHERE id = ?`,
      params
    ) as any;
    return result.affectedRows > 0;
  },

  // Excluir componente
  delete: async (id: number): Promise<boolean> => {
    // Verificar se há notas associadas
    const notas = await query<any[]>(
      "SELECT COUNT(*) as count FROM notas_componentes WHERE idComponente = ?",
      [id]
    );
    if (notas[0]?.count > 0) {
      throw new Error("Não é possível excluir o componente. Existem notas associadas.");
    }

    const result = await query<any>(
      "DELETE FROM componentes_nota WHERE id = ?",
      [id]
    ) as any;
    return result.affectedRows > 0;
  },
};

