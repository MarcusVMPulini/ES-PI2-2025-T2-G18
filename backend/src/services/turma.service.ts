import { query } from "../config/database";

export interface Turma {
  id?: number;
  nome: string;
  idDisciplina: number;
  ano: number;
  semestre: number;
  codigo?: string;
  apelido?: string;
}

export const turmaService = {
  // Listar todas as turmas
  findAll: async (): Promise<Turma[]> => {
    return await query<Turma[]>("SELECT * FROM turmas ORDER BY id");
  },

  // Buscar turma por ID
  findById: async (id: number): Promise<Turma | null> => {
    const results = await query<Turma[]>(
      "SELECT * FROM turmas WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar nova turma
  create: async (
    nome: string,
    idDisciplina: number,
    ano: number,
    semestre: number,
    codigo?: string,
    apelido?: string
  ): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO turmas (nome, idDisciplina, ano, semestre, codigo, apelido) VALUES (?, ?, ?, ?, ?, ?)",
      [nome, idDisciplina, ano, semestre, codigo || null, apelido || null]
    ) as any;
    return result.insertId;
  },

  // Atualizar turma
  update: async (
    id: number,
    nome?: string,
    idDisciplina?: number,
    ano?: number,
    semestre?: number,
    codigo?: string,
    apelido?: string
  ): Promise<boolean> => {
    const updates: string[] = [];
    const params: any[] = [];

    if (nome !== undefined) {
      updates.push("nome = ?");
      params.push(nome);
    }
    if (idDisciplina !== undefined) {
      updates.push("idDisciplina = ?");
      params.push(idDisciplina);
    }
    if (ano !== undefined) {
      updates.push("ano = ?");
      params.push(ano);
    }
    if (semestre !== undefined) {
      updates.push("semestre = ?");
      params.push(semestre);
    }
    if (codigo !== undefined) {
      updates.push("codigo = ?");
      params.push(codigo);
    }
    if (apelido !== undefined) {
      updates.push("apelido = ?");
      params.push(apelido);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const result = await query<any>(
      `UPDATE turmas SET ${updates.join(", ")} WHERE id = ?`,
      params
    ) as any;
    return result.affectedRows > 0;
  },

  // Excluir turma
  delete: async (id: number): Promise<boolean> => {
    const result = await query<any>(
      "DELETE FROM turmas WHERE id = ?",
      [id]
    ) as any;
    return result.affectedRows > 0;
  },

  // Listar turmas por disciplina
  findByDisciplina: async (idDisciplina: number): Promise<Turma[]> => {
    return await query<Turma[]>(
      "SELECT * FROM turmas WHERE idDisciplina = ? ORDER BY ano DESC, semestre DESC",
      [idDisciplina]
    );
  },

  // Verificar se turma tem dependências (matrículas, notas)
  hasDependencies: async (id: number): Promise<{ hasMatriculas: boolean; hasNotas: boolean }> => {
    const matriculas = await query<any[]>(
      "SELECT COUNT(*) as count FROM matriculas WHERE idTurma = ?",
      [id]
    );
    const notas = await query<any[]>(
      "SELECT COUNT(*) as count FROM notas_componentes WHERE idTurma = ?",
      [id]
    );
    return {
      hasMatriculas: matriculas[0]?.count > 0,
      hasNotas: notas[0]?.count > 0,
    };
  },
};

