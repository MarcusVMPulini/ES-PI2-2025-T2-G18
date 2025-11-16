import { Request, Response } from "express";
import { turmaService } from "../services/turma.service";
import { disciplinaService } from "../services/disciplina.service";
import { alunoService } from "../services/aluno.service";
import { matriculaService } from "../services/matricula.service";
import { notaComponenteService } from "../services/nota-componente.service";
import { componenteNotaService } from "../services/componente-nota.service";
import { query } from "../config/database";


// ✅ Listar todas as turmas
export const listarTurmas = async (req: Request, res: Response) => {
  try {
    const turmas = await turmaService.findAll();
    return res.json(turmas);
  } catch (error) {
    console.error("Erro ao listar turmas:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Buscar turma por ID
export const buscarTurmaPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const turma = await turmaService.findById(Number(id));
    
    if (!turma) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }
    
    return res.json(turma);
  } catch (error) {
    console.error("Erro ao buscar turma:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Criar turma
export const criarTurma = async (req: Request, res: Response) => {
  try {
    const { nome, idDisciplina, ano, semestre, codigo, apelido } = req.body;

    if (!nome || !idDisciplina || !ano || !semestre) {
      return res.status(400).json({ message: "Nome, idDisciplina, ano e semestre são obrigatórios" });
    }

    // Verificar se a disciplina existe
    const existeDisciplina = await disciplinaService.findById(Number(idDisciplina), (req as any).user.id);
    if (!existeDisciplina) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    const id = await turmaService.create(
      nome,
      Number(idDisciplina),
      Number(ano),
      Number(semestre),
      codigo,
      apelido
    );
    const nova = await turmaService.findById(id);

    return res.status(201).json({ message: "Turma criada", turma: nova });
  } catch (error) {
    console.error("Erro ao criar turma:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Editar turma
export const editarTurma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, idDisciplina, ano, semestre, codigo, apelido } = req.body;

    const existe = await turmaService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    // Se estiver alterando a disciplina, verificar se existe
    if (idDisciplina) {
      const existeDisciplina = await disciplinaService.findById(Number(idDisciplina), (req as any).user.id);
      if (!existeDisciplina) {
        return res.status(404).json({ message: "Disciplina não encontrada" });
      }
    }

    const atualizado = await turmaService.update(
      Number(id),
      nome,
      idDisciplina ? Number(idDisciplina) : undefined,
      ano ? Number(ano) : undefined,
      semestre ? Number(semestre) : undefined,
      codigo,
      apelido
    );

    if (!atualizado) {
      return res.status(500).json({ message: "Erro ao atualizar turma" });
    }

    const turma = await turmaService.findById(Number(id));
    return res.json({ message: "Turma atualizada", turma });
  } catch (error) {
    console.error("Erro ao editar turma:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Excluir turma
export const excluirTurma = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await turmaService.findById(Number(id));
    if (!existe) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    // Verificar dependências (opcional - pode ser apenas aviso)
    const dependencias = await turmaService.hasDependencies(Number(id));
    if (dependencias.hasMatriculas || dependencias.hasNotas) {
      // A exclusão é irrevogável conforme escopo, mas avisamos
      // O frontend deve mostrar confirmação modal
    }

    const deletado = await turmaService.delete(Number(id));
    if (!deletado) {
      return res.status(500).json({ message: "Erro ao excluir turma" });
    }

    return res.json({ message: "Turma excluída com sucesso. Esta operação é irrevogável." });
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Importar alunos via CSV
export const importarAlunosCSV = async (req: Request, res: Response) => {
  try {
    const { idTurma } = req.params;
    const { alunos } = req.body; // Array de { ra, nome }

    if (!alunos || !Array.isArray(alunos)) {
      return res.status(400).json({ message: "Formato inválido. Envie um array de alunos com 'ra' e 'nome'" });
    }

    // Verificar se turma existe
    const turma = await turmaService.findById(Number(idTurma));
    if (!turma) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    const alunosImportados: any[] = [];
    const alunosIgnorados: any[] = [];

    for (const alunoData of alunos) {
      const { ra, nome } = alunoData;

      if (!ra || !nome) {
        alunosIgnorados.push({ ...alunoData, motivo: "RA ou nome faltando" });
        continue;
      }

      // Verificar se aluno já existe (por RA)
      let aluno = await alunoService.findByRA(ra);

      if (!aluno) {
        // Criar novo aluno
        const alunoId = await alunoService.create(nome, ra);
        aluno = await alunoService.findById(alunoId);
      }

      if (!aluno) {
        alunosIgnorados.push({ ra, nome, motivo: "Erro ao criar/buscar aluno" });
        continue;
      }

      // Verificar se já está matriculado
      const jaMatriculado = await matriculaService.findByAlunoAndTurma(
        aluno.id!,
        Number(idTurma)
      );

      if (!jaMatriculado) {
        // Matricular aluno
        await matriculaService.create(aluno.id!, Number(idTurma));
        alunosImportados.push({ id: aluno.id, ra: aluno.ra, nome: aluno.nome });
      } else {
        // Aluno já matriculado - não sobrescrever (conforme escopo)
        alunosIgnorados.push({ ra, nome, motivo: "Aluno já matriculado nesta turma" });
      }
    }

    return res.status(200).json({
      message: "Importação concluída",
      importados: alunosImportados.length,
      ignorados: alunosIgnorados.length,
      alunosImportados,
      alunosIgnorados,
    });
  } catch (error) {
    console.error("Erro ao importar alunos:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// ✅ Exportar notas em CSV
export const exportarNotasCSV = async (req: Request, res: Response) => {
  try {
    const { idTurma } = req.params;

    // Verificar se turma existe
    const turma = await turmaService.findById(Number(idTurma));
    if (!turma) {
      return res.status(404).json({ message: "Turma não encontrada" });
    }

    // Verificar se todas as notas estão preenchidas
    const notasCompletas = await notaComponenteService.verificarNotasCompletas(Number(idTurma));
    if (!notasCompletas) {
      return res.status(400).json({
        message: "Não é possível exportar. Todas as notas devem estar preenchidas.",
      });
    }

    // Buscar disciplina para pegar componentes e sigla
    const disciplina = await disciplinaService.findById(turma.idDisciplina, (req as any).user.id);
    if (!disciplina) {
      return res.status(404).json({ message: "Disciplina não encontrada" });
    }

    // Buscar componentes da disciplina
    const componentes = await componenteNotaService.findByDisciplina(turma.idDisciplina);
    if (componentes.length === 0) {
      return res.status(400).json({ message: "Não há componentes de nota cadastrados" });
    }

    // Buscar todos os alunos matriculados
    const matriculas = await query<any[]>(
      `SELECT a.id, a.ra, a.nome 
       FROM alunos a
       INNER JOIN matriculas m ON m.idAluno = a.id
       WHERE m.idTurma = ?
       ORDER BY a.nome`,
      [idTurma]
    );

    // Montar dados para CSV
    const dadosCSV: any[] = [];

    for (const matricula of matriculas) {
      const alunoId = matricula.id;
      const notas = await notaComponenteService.findByAlunoAndTurma(alunoId, Number(idTurma));

      // Calcular nota final
      const { notaFinal } = await notaComponenteService.calcularNotaFinalAluno(
        alunoId,
        Number(idTurma),
        (req as any).user
      );

      // Montar objeto com RA, Nome e notas por componente
      const linha: any = {
        Matricula: matricula.ra,
        Nome: matricula.nome,
      };

      // Adicionar colunas para cada componente
      componentes.forEach((comp) => {
        const nota = notas.find((n) => n.idComponente === comp.id);
        linha[comp.sigla] = nota ? nota.valor.toFixed(2) : "-";
      });

      linha["Nota Final"] = notaFinal.toFixed(2);

      dadosCSV.push(linha);
    }

    // Gerar nome do arquivo: YYYY-MM-DD_HHmmssms-TurmaX_Sigla.csv
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");
    const milissegundo = String(agora.getMilliseconds()).padStart(3, "0");

    const siglaDisciplina = disciplina.sigla || "DISC";
    const nomeTurma = turma.codigo || turma.nome || "T1";

    const nomeArquivo = `${ano}-${mes}-${dia}_${hora}${minuto}${segundo}${milissegundo}-${nomeTurma}-${siglaDisciplina}.csv`;

    // Converter para CSV
    const headers = ["Matricula", "Nome", ...componentes.map((c) => c.sigla), "Nota Final"];
    const linhasCSV = [
      headers.join(","),
      ...dadosCSV.map((linha) =>
        headers.map((h) => `"${linha[h] || ""}"`).join(",")
      ),
    ];
    const csvContent = linhasCSV.join("\n");

    // Retornar CSV
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo}"`);
    res.setHeader("Content-Length", Buffer.byteLength(csvContent, "utf8").toString());

    return res.send(csvContent);
  } catch (error) {
    console.error("Erro ao exportar notas:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
