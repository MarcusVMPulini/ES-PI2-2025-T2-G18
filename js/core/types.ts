// src/core/types.ts
export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
}

export interface Instituicao {
  id: string;
  userId: string;
  nomeInstituicao: string;
  nomeCurso: string;
}

export interface Disciplina {
  id: string;
  instituicaoId: string;
  nome: string;
  sigla: string;
  codigo?: string;
  periodo?: string;
}

export interface Turma {
  id: string;
  disciplinaId: string;
  nome: string;
  apelido?: string;
}

export interface Aluno {
  id: string;
  turmaId: string;
  matricula: string;
  nome: string;
}

export interface Componente {
  id: string;
  disciplinaId: string;
  nome: string;
  sigla: string;
  descricao?: string;
}

export interface Nota {
  idAluno: string;
  idComponente: string;
  valor: number | null;
}

export interface AppData {
  users: User[];
  sessions: {
    currentUserId: string | null;
  };
  instituicoes: Instituicao[];
  disciplinas: Disciplina[];
  turmas: Turma[];
  alunos: Aluno[];
  componentes: Componente[];
  notas: Nota[];
}
