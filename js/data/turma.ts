// src/data/turma.ts
import { readAnd, writeAnd } from "../core/storage";
import type { Turma } from "../core/types";

export function addTurma(disciplinaId: string, nome: string, apelido: string): Turma {
  const t: Turma = { id: "turma_" + Date.now(), disciplinaId, nome, apelido };
  writeAnd(db => db.turmas.push(t));
  return t;
}

export function listTurmasByDisciplina(disciplinaId: string): Turma[] {
  return readAnd(db => db.turmas.filter(t => t.disciplinaId === disciplinaId));
}

export function getTurma(turmaId: string): Turma | null {
  return readAnd(db => db.turmas.find(t => t.id === turmaId) ?? null);
}

export function deleteTurma(turmaId: string): void {
  writeAnd(db => {
    // remove alunos da turma
    db.alunos = db.alunos.filter(a => a.turmaId !== turmaId);
    // remove notas relacionadas (procura alunos removidos)
    db.notas = db.notas.filter(n => {
      const aluno = db.alunos.find(a => a.id === n.idAluno);
      return aluno && aluno.turmaId !== turmaId;
    });
    // remove turma
    db.turmas = db.turmas.filter(t => t.id !== turmaId);
  });
}
