//Autores: Marcus, Arthur

//imports
import { query } from "../config/database";

export interface Nota {
  id?: number;
  idAluno: number;
  idTurma: number;
  nota1: number;
  nota2: number;
  media: number;
  situacao: string;
}

// Função para calcular média e situação
export const calcularMedia = (nota1: number, nota2: number): { media: number; situacao: string } => {
  const media = (nota1 + nota2) / 2;
  const situacao = media >= 6 ? "Aprovado" : "Reprovado";
  return { media, situacao };
};

export const notasService = {
  // Listar todas as notas
  findAll: async (): Promise<Nota[]> => {
    return await query<Nota[]>("SELECT * FROM notas ORDER BY id");
  },

  // Buscar nota por ID
  findById: async (id: number): Promise<Nota | null> => {
    const results = await query<Nota[]>(
      "SELECT * FROM notas WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Buscar notas por aluno
  findByAluno: async (idAluno: number): Promise<Nota[]> => {
    return await query<Nota[]>(
      "SELECT * FROM notas WHERE idAluno = ? ORDER BY id",
      [idAluno]
    );
  },

  // Buscar notas por turma
  findByTurma: async (idTurma: number): Promise<Nota[]> => {
    return await query<Nota[]>(
      "SELECT * FROM notas WHERE idTurma = ? ORDER BY id",
      [idTurma]
    );
  },

  // Buscar nota por aluno e turma
  findByAlunoAndTurma: async (idAluno: number, idTurma: number): Promise<Nota | null> => {
    const results = await query<Nota[]>(
      "SELECT * FROM notas WHERE idAluno = ? AND idTurma = ?",
      [idAluno, idTurma]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar nova nota
  create: async (
    idAluno: number,
    idTurma: number,
    nota1: number,
    nota2: number
  ): Promise<number> => {
    const { media, situacao } = calcularMedia(nota1, nota2);
    
    const result = await query<any>(
      "INSERT INTO notas (idAluno, idTurma, nota1, nota2, media, situacao) VALUES (?, ?, ?, ?, ?, ?)",
      [idAluno, idTurma, nota1, nota2, media, situacao]
    ) as any;
    return result.insertId;
  },

  // Atualizar nota
  update: async (
    id: number,
    nota1?: number,
    nota2?: number
  ): Promise<boolean> => {
    // Buscar nota atual
    const notaAtual = await notasService.findById(id);
    if (!notaAtual) return false;

    // Usar valores novos ou manter os atuais
    const novaNota1 = nota1 !== undefined ? nota1 : notaAtual.nota1;
    const novaNota2 = nota2 !== undefined ? nota2 : notaAtual.nota2;

    // Recalcular média e situação
    const { media, situacao } = calcularMedia(novaNota1, novaNota2);

    const updates: string[] = [];
    const params: any[] = [];

    if (nota1 !== undefined) {
      updates.push("nota1 = ?");
      params.push(nota1);
    }
    if (nota2 !== undefined) {
      updates.push("nota2 = ?");
      params.push(nota2);
    }

    updates.push("media = ?");
    params.push(media);
    updates.push("situacao = ?");
    params.push(situacao);

    params.push(id);
    const result = await query<any>(
      `UPDATE notas SET ${updates.join(", ")} WHERE id = ?`,
      params
    ) as any;
    return result.affectedRows > 0;
  },

  // Criar ou atualizar nota final (usado para salvar nota final calculada dos componentes)
  upsertNotaFinal: async (
    idAluno: number,
    idTurma: number,
    media: number,
    situacao: string
  ): Promise<number> => {
    try {
      console.log(`[upsertNotaFinal] Salvando nota final - Aluno: ${idAluno}, Turma: ${idTurma}, Media: ${media}, Situacao: ${situacao}`);
      
      // Verificar se já existe
      const existe = await notasService.findByAlunoAndTurma(idAluno, idTurma);
      console.log(`[upsertNotaFinal] Nota existente:`, existe);

      if (existe) {
        // Validar media antes de salvar
        if (isNaN(media) || !isFinite(media)) {
          console.error(`[upsertNotaFinal] Media inválida: ${media}, não atualizando`);
          throw new Error(`Media inválida: ${media}`);
        }
        
        // Atualizar apenas media e situacao
        const result = await query<any>(
          "UPDATE notas SET media = ?, situacao = ? WHERE id = ?",
          [media, situacao, existe.id]
        ) as any;
        console.log(`[upsertNotaFinal] Nota atualizada. ID: ${existe.id}, Rows affected: ${result.affectedRows}`);
        return existe.id!;
      } else {
        // Validar media antes de salvar
        if (isNaN(media) || !isFinite(media)) {
          console.error(`[upsertNotaFinal] Media inválida: ${media}, não criando registro`);
          throw new Error(`Media inválida: ${media}`);
        }
        
        // Criar novo registro (nota1 e nota2 são 0, não são usados no sistema de componentes)
        const result = await query<any>(
          "INSERT INTO notas (idAluno, idTurma, nota1, nota2, media, situacao) VALUES (?, ?, 0, 0, ?, ?)",
          [idAluno, idTurma, media, situacao]
        ) as any;
        console.log(`[upsertNotaFinal] Nota criada. ID: ${result.insertId}`);
        return result.insertId;
      }
    } catch (error: any) {
      console.error(`[upsertNotaFinal] Erro ao salvar nota final:`, error);
      throw error;
    }
  },

  // Excluir nota
  delete: async (id: number): Promise<boolean> => {
    const result = await query<any>(
      "DELETE FROM notas WHERE id = ?",
      [id]
    ) as any;
    return result.affectedRows > 0;
  },
};

