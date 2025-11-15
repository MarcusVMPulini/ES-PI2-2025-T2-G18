// src/data/instituicao.ts
import { readAnd, writeAnd } from "../core/storage.ts";
import type { Instituicao } from "../core/types.ts";
import { getCurrentUser } from "../core/auth.ts";

export function addInstituicao(nomeInstituicao: string, nomeCurso: string): Instituicao | null {
  const user = getCurrentUser();
  if (!user) return null;
  const inst: Instituicao = { id: "inst_" + Date.now(), userId: user.id, nomeInstituicao, nomeCurso };
  writeAnd(db => db.instituicoes.push(inst));
  return inst;
}

export function listInstituicoesByUser(): Instituicao[] {
  const user = getCurrentUser();
  if (!user) return [];
  return readAnd(db => db.instituicoes.filter(i => i.userId === user.id));
}

export function getInstituicaoById(id: string): Instituicao | null {
  return readAnd(db => db.instituicoes.find(i => i.id === id) ?? null);
}
