// src/data/aluno.ts
import { readAnd, writeAnd } from "../core/storage";
import type { Aluno } from "../core/types";

export function addAluno(turmaId: string, matricula: string, nome: string): Aluno {
  const a: Aluno = { id: "aluno_" + Date.now() + "_" + Math.floor(Math.random() * 1000), turmaId, matricula, nome };
  writeAnd(db => db.alunos.push(a));
  return a;
}

export function listAlunosByTurma(turmaId: string): Aluno[] {
  return readAnd(db => db.alunos.filter(a => a.turmaId === turmaId));
}

export async function importCSVToTurma(turmaId: string, csvText: string): Promise<void> {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim() !== "");
  // pula header se houver
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 2) continue;
    const matricula = cols[0].trim();
    const nome = cols[1].trim();
    if (!matricula || !nome) continue;
    const exists = readAnd(db => db.alunos.find(a => a.turmaId === turmaId && a.matricula === matricula));
    if (!exists) {
      addAluno(turmaId, matricula, nome);
    }
  }
}
