//Autor: Marcus

//imports
import { query } from "../config/database";

export interface Matricula {
  id?: number;
  idAluno: number;
  idTurma: number;
}

export const matriculaService = {
  // Listar todas as matrículas
  findAll: async (): Promise<Matricula[]> => {
    return await query<Matricula[]>("SELECT * FROM matriculas ORDER BY id");
  },

  // Buscar matrícula por ID
  findById: async (id: number): Promise<Matricula | null> => {
    const results = await query<Matricula[]>(
      "SELECT * FROM matriculas WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Verificar se matrícula já existe
  findByAlunoAndTurma: async (idAluno: number, idTurma: number): Promise<Matricula | null> => {
    const results = await query<Matricula[]>(
      "SELECT * FROM matriculas WHERE idAluno = ? AND idTurma = ?",
      [idAluno, idTurma]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar nova matrícula
  create: async (idAluno: number, idTurma: number): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO matriculas (idAluno, idTurma) VALUES (?, ?)",
      [idAluno, idTurma]
    ) as any;
    return result.insertId;
  },

  // Remover matrícula
  delete: async (idAluno: number, idTurma: number): Promise<boolean> => {
    const result = await query<any>(
      "DELETE FROM matriculas WHERE idAluno = ? AND idTurma = ?",
      [idAluno, idTurma]
    ) as any;
    return result.affectedRows > 0;
  },

  // Listar matrículas por aluno
  findByAluno: async (idAluno: number): Promise<Matricula[]> => {
    return await query<Matricula[]>(
      "SELECT * FROM matriculas WHERE idAluno = ?",
      [idAluno]
    );
  },

  // Listar matrículas por turma
  findByTurma: async (idTurma: number): Promise<Matricula[]> => {
    return await query<Matricula[]>(
      "SELECT * FROM matriculas WHERE idTurma = ?",
      [idTurma]
    );
  },
};

