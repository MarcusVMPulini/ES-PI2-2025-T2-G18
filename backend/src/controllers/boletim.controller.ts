import { Request, Response } from "express";
import { alunoService } from "../services/aluno.service";
import { notasService } from "../services/notas.service";
import { turmaService } from "../services/turma.service";
import { disciplinaService } from "../services/disciplina.service";
import { cursoService } from "../services/curso.service";

export const boletimPorAluno = async (req: Request, res: Response) => {
  try {
    const { idAluno } = req.params;

    // Verificar se aluno existe
    const aluno = await alunoService.findById(Number(idAluno));
    if (!aluno) {
      return res.status(404).json({ message: "Aluno não encontrado" });
    }

    // Buscar todas as notas do aluno
    const notas = await notasService.findByAluno(Number(idAluno));

    // Montar boletim com JOINs
    const boletim = await Promise.all(
      notas.map(async (nota) => {
        const turma = await turmaService.findById(nota.idTurma);
        if (!turma) return null;

        const disciplina = await disciplinaService.findById(turma.idDisciplina, (req as any).user.id);
        if (!disciplina) return null;

        const curso = await cursoService.findById(disciplina.idCurso, (req as any).user.id);
        if (!curso) return null;

        return {
          aluno: aluno.nome,
          curso: curso.nomeCurso,
          disciplina: disciplina.nome,
          turma: turma.nome,
          ano: turma.ano,
          semestre: turma.semestre,
          nota1: nota.nota1,
          nota2: nota.nota2,
          media: nota.media,
          situacao: nota.situacao,
        };
      })
    );

    // Remover nulls (caso algum relacionamento não exista)
    const boletimFiltrado = boletim.filter((item) => item !== null);

    return res.json(boletimFiltrado);
  } catch (error) {
    console.error("Erro ao buscar boletim:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
