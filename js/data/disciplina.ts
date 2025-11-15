// src/data/disciplina.ts
import { readAnd, writeAnd } from "../core/storage.ts";
import type { Disciplina } from "../core/types.ts";

export function addDisciplina(instituicaoId: string, nome: string, sigla: string, codigo: string, periodo: string): Disciplina {
  const d: Disciplina = { id: "disc_" + Date.now(), instituicaoId, nome, sigla, codigo, periodo };
  writeAnd(db => db.disciplinas.push(d));
  return d;
}

export function listDisciplinasByInstituicao(instId: string): Disciplina[] {
  return readAnd(db => db.disciplinas.filter(d => d.instituicaoId === instId));
}

export function getDisciplinaById(id: string): Disciplina | null {
  return readAnd(db => db.disciplinas.find(d => d.id === id) ?? null);
}
