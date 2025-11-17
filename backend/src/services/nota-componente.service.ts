import { query } from "../config/database";
import { disciplinaService } from "./disciplina.service";
import { componenteNotaService } from "./componente-nota.service";
import { notasService } from "./notas.service";

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
  notas: { sigla: string; valor: number; peso?: number | null }[],
  formula: string
): number => {
  console.log(`[calcularNotaFinal] Iniciando cálculo. Notas:`, notas, `Fórmula:`, formula);
  
  // Garantir que todos os valores sejam números válidos
  const notasValidas = notas.filter(n => {
    const valor = typeof n.valor === 'number' ? n.valor : parseFloat(n.valor);
    return !isNaN(valor) && valor >= 0 && valor <= 10;
  });
  
  console.log(`[calcularNotaFinal] Notas válidas:`, notasValidas);
  
  if (!formula || formula.trim() === "") {
    // Se não há fórmula, verificar se há pesos definidos
    const notasComPeso = notasValidas.filter(n => n.peso !== null && n.peso !== undefined && n.peso > 0);
    
    if (notasComPeso.length > 0) {
      // Calcular média ponderada
      let somaPonderada = 0;
      let somaPesos = 0;
      
      notasComPeso.forEach(n => {
        const valor = typeof n.valor === 'number' ? n.valor : parseFloat(n.valor);
        const peso = typeof n.peso === 'number' ? n.peso : parseFloat(n.peso || '0');
        somaPonderada += valor * peso;
        somaPesos += peso;
      });
      
      if (somaPesos > 0) {
        // Calcular média ponderada
        // Se os pesos somarem 100%, usar diretamente: (nota * peso) / 100
        // Se não, normalizar: (nota * peso) / soma(pesos) * (100 / soma(pesos))
        let mediaPonderada;
        if (Math.abs(somaPesos - 100) < 0.01) {
          // Pesos somam 100%, usar diretamente
          mediaPonderada = somaPonderada / 100;
        } else {
          // Pesos não somam 100%, normalizar
          mediaPonderada = somaPonderada / somaPesos;
        }
        console.log(`[calcularNotaFinal] Média ponderada calculada:`, mediaPonderada, `(soma pesos: ${somaPesos}%)`);
        // Garantir que está entre 0 e 10
        return Number(Math.max(0, Math.min(10, mediaPonderada)).toFixed(2));
      }
    }
    
    // Se não há pesos ou pesos inválidos, calcular média simples
    if (notasValidas.length === 0) {
      console.log(`[calcularNotaFinal] Nenhuma nota válida, retornando 0`);
      return 0;
    }
    const soma = notasValidas.reduce((acc, n) => {
      const valor = typeof n.valor === 'number' ? n.valor : parseFloat(n.valor);
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);
    const media = soma / notasValidas.length;
    console.log(`[calcularNotaFinal] Média simples calculada:`, media);
    return Number(media.toFixed(2));
  }

  try {
    // Substituir siglas pelos valores
    let formulaCalculo = formula;
    notasValidas.forEach((nota) => {
      const valor = typeof nota.valor === 'number' ? nota.valor : parseFloat(nota.valor);
      const regex = new RegExp(`\\b${nota.sigla}\\b`, "g");
      formulaCalculo = formulaCalculo.replace(regex, valor.toString());
    });
    console.log(`[calcularNotaFinal] Fórmula após substituição:`, formulaCalculo);

    // Avaliar a fórmula (cuidado com segurança - em produção usar um parser seguro)
    // Por enquanto, suporta operações básicas: +, -, *, /, (, )
    const resultado = Function(`"use strict"; return (${formulaCalculo})`)();
    const resultadoLimitado = Math.max(0, Math.min(10, resultado));
    console.log(`[calcularNotaFinal] Resultado da fórmula:`, resultado, `Limitado:`, resultadoLimitado);
    return Number(resultadoLimitado.toFixed(2)); // Limitar entre 0 e 10
  } catch (error) {
    console.error("[calcularNotaFinal] Erro ao calcular nota final:", error);
    // Fallback para média simples
    if (notasValidas.length === 0) {
      console.log(`[calcularNotaFinal] Fallback: nenhuma nota válida, retornando 0`);
      return 0;
    }
    const soma = notasValidas.reduce((acc, n) => {
      const valor = typeof n.valor === 'number' ? n.valor : parseFloat(n.valor);
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);
    const media = soma / notasValidas.length;
    console.log(`[calcularNotaFinal] Fallback: média simples calculada:`, media);
    return Number(media.toFixed(2));
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
    console.log(`[calcularNotaFinalAluno] Notas encontradas para aluno ${idAluno}:`, notas);

    // Buscar componentes para pegar os pesos
    const todosComponentes = await componenteNotaService.findByDisciplina(turma[0].idDisciplina);
    
    // Mapear para formato esperado pela função de cálculo (incluindo peso)
    const notasFormatadas = notas.map((n) => {
      // Garantir que valor seja um número
      const valor = typeof n.valor === 'number' ? n.valor : parseFloat(n.valor);
      // Buscar o componente para pegar o peso
      const componente = todosComponentes.find(c => c.id === n.idComponente);
      const peso = componente && componente.peso !== null && componente.peso !== undefined 
        ? (typeof componente.peso === 'number' ? componente.peso : parseFloat(String(componente.peso)))
        : null;
      
      return {
        sigla: n.siglaComponente || "",
        valor: isNaN(valor) ? 0 : valor,
        peso: peso !== null && !isNaN(peso) ? peso : null,
      };
    });
    console.log(`[calcularNotaFinalAluno] Notas formatadas:`, notasFormatadas);
    console.log(`[calcularNotaFinalAluno] Fórmula:`, disciplina.formula_nota_final || "(média ponderada ou simples)");

    // Calcular nota final
    const notaFinal = calcularNotaFinal(
      notasFormatadas,
      disciplina.formula_nota_final || ""
    );
    console.log(`[calcularNotaFinalAluno] Nota final calculada:`, notaFinal);

    // Determinar situação
    const situacao = notaFinal >= 6 ? "Aprovado" : "Reprovado";

    console.log(`[calcularNotaFinalAluno] Calculado - Aluno: ${idAluno}, Turma: ${idTurma}, Nota Final: ${notaFinal}, Situacao: ${situacao}`);

    // Salvar nota final e situação na tabela notas
    try {
      const notaId = await notasService.upsertNotaFinal(idAluno, idTurma, notaFinal, situacao);
      console.log(`[calcularNotaFinalAluno] Nota final salva com sucesso. ID: ${notaId}`);
    } catch (error: any) {
      console.error(`[calcularNotaFinalAluno] Erro ao salvar nota final:`, error);
      // Não lançar erro, apenas logar, para não quebrar o fluxo
    }

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

