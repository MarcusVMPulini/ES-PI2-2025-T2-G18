// src/data/componente.ts
import { readAnd, writeAnd } from "../core/storage";
import type { Componente } from "../core/types";

export function addComponente(disciplinaId: string, nome: string, sigla: string, descricao: string): Componente {
  const c: Componente = { id: "comp_" + Date.now(), disciplinaId, nome, sigla, descricao };
  writeAnd(db => db.componentes.push(c));
  return c;
}

export function listComponentesByDisciplina(disciplinaId: string): Componente[] {
  return readAnd(db => db.componentes.filter(c => c.disciplinaId === disciplinaId));
}
