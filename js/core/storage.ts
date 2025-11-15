// src/core/storage.ts
import type { AppData } from "./types";

const STORAGE_KEY = "notadez_data";

export function getRawAppData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const init: AppData = {
      users: [],
      sessions: { currentUserId: null },
      instituicoes: [],
      disciplinas: [],
      turmas: [],
      alunos: [],
      componentes: [],
      notas: [],
    };
    return init;
  }
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    // se tiver JSON inválido, reinicia
    const init: AppData = {
      users: [],
      sessions: { currentUserId: null },
      instituicoes: [],
      disciplinas: [],
      turmas: [],
      alunos: [],
      componentes: [],
      notas: [],
    };
    return init;
  }
}

export function setRawAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// helpers genéricos
export function readAnd<T>(cb: (data: AppData) => T): T {
  const db = getRawAppData();
  return cb(db);
}

export function writeAnd(cb: (data: AppData) => void): void {
  const db = getRawAppData();
  cb(db);
  setRawAppData(db);
}
