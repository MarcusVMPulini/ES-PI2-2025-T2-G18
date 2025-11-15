// src/data/nota.ts
import { readAnd, writeAnd } from "../core/storage.ts";
import type { Nota } from "../core/types.ts";
import { listAlunosByTurma } from "./aluno.ts";
import { getTurma } from "./turma.ts";
import { getDisciplinaById, listComponentesByDisciplina } from "./disciplina"; // careful re-export below

export function setNotaValor(idAluno: string, idComponente: string, valor: number | "" | null): void {
  writeAnd(db => {
    let nota = db.notas.find(n => n.idAluno === idAluno && n.idComponente === idComponente);
    const v = (valor === "" || valor === null) ? null : Number(valor);
    if (!nota) {
      nota = { idAluno, idComponente, valor: v };
      db.notas.push(nota);
    } else {
      nota.valor = v;
    }
  });
}

export function getNotaValor(idAluno: string, idComponente: string): string | number {
  return readAnd(db => {
    const n = db.notas.find(n => n.idAluno === idAluno && n.idComponente === idComponente);
    if (!n) return "";
    return n.valor === null ? "" : n.valor;
  });
}

/**
 * exportTurmaCSV: monta e retorna o CSV como string.
 */
export function exportTurmaCSVContent(turmaId: string): string {
  const turma = getTurma(turmaId);
  const disciplina = turma ? getDisciplinaById(turma.disciplinaId) : null;
  const comps = disciplina ? listComponentesByDisciplina(disciplina.id) : [];
  const alunos = listAlunosByTurma(turmaId);

  const header = ["Matricula", "Nome", ...comps.map(c => c.sigla), "MediaFinal"];
  const rows: string[] = [header.join(",")];

  alunos.forEach(al => {
    const cols: string[] = [al.matricula, al.nome];
    let soma = 0;
    let count = 0;
    comps.forEach(c => {
      const v = getNotaValor(al.id, c.id);
      const num = v !== "" ? Number(v) : NaN;
      cols.push(isNaN(num) ? "" : num.toFixed(2));
      if (!isNaN(num)) { soma += num; count++; }
    });
    const media = (count > 0 ? (soma / count) : 0).toFixed(2);
    cols.push(media);
    rows.push(cols.join(","));
  });

  return rows.join("\n");
}
