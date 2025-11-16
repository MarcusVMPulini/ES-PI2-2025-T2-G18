import { query } from "../config/database";
import { disciplinaService } from "./disciplina.service";
import { componenteNotaService } from "./componente-nota.service";

export interface NotaComponente {
  id?: number;
  idAluno: number;
  idTurma: number;
  idComponente: number;
  valor: number;
  created_at?: Date;
  updated_at?: Date;
}

// Interface para retornar notas com informações completas
export interface NotaComponenteCompleta extends NotaComponente {
  nomeAluno?: string;
  raAluno?: string;
  nomeComponente?: string;
  siglaComponente?: string;
}

// Função para calcular nota final baseada na fórmula
export const calcularNotaFinal = (
  notas: { sigla: string; valor: number }[],
  formula: string
): number => {
  if (!formula || formula.trim() === "") {
    // Se não há fórmula, calcula média simples
    if (notas.length === 0) return 0;
    const soma = notas.reduce((acc, n) => acc + n.valor, 0);
    return Number((soma / notas.length).toFixed(2));
  }

  try {
    // Substituir siglas pelos valores
    let formulaCalculo = formula;
    notas.forEach((nota) => {
      const regex = new RegExp(`\\b${nota.sigla}\\b`, "g");
      formulaCalculo = formulaCalculo.replace(regex, nota.valor.toString());
    });

    // Avaliar a fórmula (cuidado com segurança - em produção usar um parser seguro)
    // Por enquanto, suporta operações básicas: +, -, *, /, (, )
    const resultado = Function(`"use strict"; return (${formulaCalculo})`)();
    return Number(Math.max(0, Math.min(10, resultado)).toFixed(2)); // Limitar entre 0 e 10
  } catch (error) {
    console.error("Erro ao calcular nota final:", error);
    // Fallback para média simples
    if (notas.length === 0) return 0;
    const soma = notas.reduce((acc, n) => acc + n.valor, 0);
    return Number((soma / notas.length).toFixed(2));
  }
};

export const notaComponenteService = {
  // Listar todas as notas
  findAll: async (): Promise<NotaComponente[]> => {
    return await query<NotaComponente[]>("SELECT * FROM notas_componentes ORDER BY id");
  },

  // Buscar nota por ID
  findById: async (id: number): Promise<NotaComponente | null> => {
    const results = await query<NotaComponente[]>(
      "SELECT * FROM notas_componentes WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Buscar nota por aluno, turma e componente
  findByAlunoTurmaComponente: async (
    idAluno: number,
    idTurma: number,
    idComponente: number
  ): Promise<NotaComponente | null> => {
    const results = await query<NotaComponente[]>(
      "SELECT * FROM notas_componentes WHERE idAluno = ? AND idTurma = ? AND idComponente = ?",
      [idAluno, idTurma, idComponente]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Buscar todas as notas de uma turma
  findByTurma: async (idTurma: number): Promise<NotaComponenteCompleta[]> => {
    return await query<NotaComponenteCompleta[]>(
      `SELECT 
        nc.*,
        a.nome as nomeAluno,
        a.ra as raAluno,
        cn.nome as nomeComponente,
        cn.sigla as siglaComponente
      FROM notas_componentes nc
      INNER JOIN alunos a ON a.id = nc.idAluno
      INNER JOIN componentes_nota cn ON cn.id = nc.idComponente
      WHERE nc.idTurma = ?
      ORDER BY a.nome, cn.sigla`,
      [idTurma]
    );
  },

  // Buscar todas as notas de um aluno em uma turma
  findByAlunoAndTurma: async (
    idAluno: number,
    idTurma: number
  ): Promise<NotaComponenteCompleta[]> => {
    return await query<NotaComponenteCompleta[]>(
      `SELECT 
        nc.*,
        a.nome as nomeAluno,
        a.ra as raAluno,
        cn.nome as nomeComponente,
        cn.sigla as siglaComponente
      FROM notas_componentes nc
      INNER JOIN alunos a ON a.id = nc.idAluno
      INNER JOIN componentes_nota cn ON cn.id = nc.idComponente
      WHERE nc.idAluno = ? AND nc.idTurma = ?
      ORDER BY cn.sigla`,
      [idAluno, idTurma]
    );
  },

  // Buscar notas de um componente específico em uma turma
  findByTurmaAndComponente: async (
    idTurma: number,
    idComponente: number
  ): Promise<NotaComponenteCompleta[]> => {
    return await query<NotaComponenteCompleta[]>(
      `SELECT 
        nc.*,
        a.nome as nomeAluno,
        a.ra as raAluno,
        cn.nome as nomeComponente,
        cn.sigla as siglaComponente
      FROM notas_componentes nc
      INNER JOIN alunos a ON a.id = nc.idAluno
      INNER JOIN componentes_nota cn ON cn.id = nc.idComponente
      WHERE nc.idTurma = ? AND nc.idComponente = ?
      ORDER BY a.nome`,
      [idTurma, idComponente]
    );
  },

  // Criar ou atualizar nota
  upsert: async (
    idAluno: number,
    idTurma: number,
    idComponente: number,
    valor: number
  ): Promise<number> => {
    // Validar valor entre 0 e 10
    if (valor < 0 || valor > 10) {
      throw new Error("O valor da nota deve estar entre 0.00 e 10.00");
    }

    // Verificar se já existe
    const existe = await notaComponenteService.findByAlunoTurmaComponente(
      idAluno,
      idTurma,
      idComponente
    );

    if (existe) {
      // Atualizar
      await query<any>(
        "UPDATE notas_componentes SET valor = ? WHERE id = ?",
        [valor, existe.id]
      );
      return existe.id!;
    } else {
      // Criar
      const result = await query<any>(
        "INSERT INTO notas_componentes (idAluno, idTurma, idComponente, valor) VALUES (?, ?, ?, ?)",
        [idAluno, idTurma, idComponente, valor]
      ) as any;
      return result.insertId;
    }
  },

  // Atualizar nota
  update: async (
    id: number,
    valor: number
  ): Promise<boolean> => {
    // Validar valor entre 0 e 10
    if (valor < 0 || valor > 10) {
      throw new Error("O valor da nota deve estar entre 0.00 e 10.00");
    }

    const result = await query<any>(
      "UPDATE notas_componentes SET valor = ? WHERE id = ?",
      [valor, id]
    ) as any;
    return result.affectedRows > 0;
  },

  // Calcular nota final para um aluno em uma turma
  calcularNotaFinalAluno: async (
    idAluno: number,
    idTurma: number,
    user: any
  ): Promise<{ notaFinal: number; situacao: string }> => {
    // Buscar turma para pegar disciplina
    const turma = await query<any[]>(
      "SELECT idDisciplina FROM turmas WHERE id = ?",
      [idTurma]
    );
    if (!turma[0]) {
      throw new Error("Turma não encontrada");
    }

    const disciplina = await disciplinaService.findById(turma[0].idDisciplina, user.id);
    if (!disciplina) {
      throw new Error("Disciplina não encontrada");
    }

    // Buscar todas as notas do aluno na turma
    const notas = await notaComponenteService.findByAlunoAndTurma(idAluno, idTurma);

    // Mapear para formato esperado pela função de cálculo
    const notasFormatadas = notas.map((n) => ({
      sigla: n.siglaComponente || "",
      valor: n.valor,
    }));

    // Calcular nota final
    const notaFinal = calcularNotaFinal(
      notasFormatadas,
      disciplina.formula_nota_final || ""
    );

    // Determinar situação
    const situacao = notaFinal >= 6 ? "Aprovado" : "Reprovado";

    return { notaFinal, situacao };
  },

  // Verificar se todas as notas de uma turma estão preenchidas
  verificarNotasCompletas: async (idTurma: number): Promise<boolean> => {
    // Buscar turma para pegar disciplina
    const turma = await query<any[]>(
      "SELECT idDisciplina FROM turmas WHERE id = ?",
      [idTurma]
    );
    if (!turma[0]) return false;

    // Buscar todos os alunos matriculados na turma
    const alunos = await query<any[]>(
      "SELECT id FROM alunos WHERE id IN (SELECT idAluno FROM matriculas WHERE idTurma = ?)",
      [idTurma]
    );

    // Buscar todos os componentes da disciplina
    const componentes = await componenteNotaService.findByDisciplina(turma[0].idDisciplina);

    if (alunos.length === 0 || componentes.length === 0) return false;

    // Verificar se cada aluno tem nota em cada componente
    for (const aluno of alunos) {
      for (const componente of componentes) {
        const nota = await notaComponenteService.findByAlunoTurmaComponente(
          aluno.id,
          idTurma,
          componente.id!
        );
        if (!nota) return false;
      }
    }

    return true;
  },

  // Excluir nota
  delete: async (id: number): Promise<boolean> => {
    const result = await query<any>(
      "DELETE FROM notas_componentes WHERE id = ?",
      [id]
    ) as any;
    return result.affectedRows > 0;
  },
};

