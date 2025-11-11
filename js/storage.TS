// ==================== Tipos principais ====================
interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}

interface Instituicao {
  id: string;
  userId: string;
  nomeInstituicao: string;
  nomeCurso: string;
}

interface Disciplina {
  id: string;
  instituicaoId: string;
  nome: string;
  sigla: string;
  codigo: string;
  periodo: string;
}

interface Turma {
  id: string;
  disciplinaId: string;
  nome: string;
  apelido: string;
}

interface Aluno {
  id: string;
  turmaId: string;
  matricula: string;
  nome: string;
}

interface Componente {
  id: string;
  disciplinaId: string;
  nome: string;
  sigla: string;
  descricao: string;
}

interface Nota {
  idAluno: string;
  idComponente: string;
  valor: number;
}

interface AppData {
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

// ==================== Funções internas ====================
function _getAppData(): AppData {
  const raw = localStorage.getItem("notadez_data");
  if (!raw) {
    return {
      users: [],
      sessions: { currentUserId: null },
      instituicoes: [],
      disciplinas: [],
      turmas: [],
      alunos: [],
      componentes: [],
      notas: [],
    };
  }
  return JSON.parse(raw) as AppData;
}

function _setAppData(data: AppData): void {
  localStorage.setItem("notadez_data", JSON.stringify(data));
}

// ==================== Usuário / Sessão ====================
function createUser(
  nome: string,
  email: string,
  telefone: string,
  senha: string
): { ok: boolean; msg?: string; user?: User } {
  const db = _getAppData();
  const exists = db.users.find((u) => u.email === email);
  if (exists) {
    return { ok: false, msg: "E-mail já cadastrado" };
  }
  const newUser: User = {
    id: "user_" + Date.now(),
    nome,
    email,
    telefone,
    senha,
  };
  db.users.push(newUser);
  db.sessions.currentUserId = newUser.id;
  _setAppData(db);
  return { ok: true, user: newUser };
}

function loginUser(
  email: string,
  senha: string
): { ok: boolean; msg?: string; user?: User } {
  const db = _getAppData();
  const found = db.users.find((u) => u.email === email && u.senha === senha);
  if (!found) {
    return { ok: false, msg: "Credenciais inválidas" };
  }
  db.sessions.currentUserId = found.id;
  _setAppData(db);
  return { ok: true, user: found };
}

function getCurrentUser(): User | null {
  const db = _getAppData();
  if (!db.sessions.currentUserId) return null;
  return db.users.find((u) => u.id === db.sessions.currentUserId) || null;
}

function logoutUser(): void {
  const db = _getAppData();
  db.sessions.currentUserId = null;
  _setAppData(db);
}

// ==================== Instituições / Disciplinas / Turmas ====================
function addInstituicao(
  nomeInstituicao: string,
  nomeCurso: string
): Instituicao | null {
  const db = _getAppData();
  const user = getCurrentUser();
  if (!user) return null;
  const inst: Instituicao = {
    id: "inst_" + Date.now(),
    userId: user.id,
    nomeInstituicao,
    nomeCurso,
  };
  db.instituicoes.push(inst);
  _setAppData(db);
  return inst;
}

function listInstituicoesByUser(): Instituicao[] {
  const db = _getAppData();
  const user = getCurrentUser();
  if (!user) return [];
  return db.instituicoes.filter((i) => i.userId === user.id);
}

function addDisciplina(
  instituicaoId: string,
  nome: string,
  sigla: string,
  codigo: string,
  periodo: string
): Disciplina {
  const db = _getAppData();
  const disc: Disciplina = {
    id: "disc_" + Date.now(),
    instituicaoId,
    nome,
    sigla,
    codigo,
    periodo,
  };
  db.disciplinas.push(disc);
  _setAppData(db);
  return disc;
}

function listDisciplinasByInstituicao(instId: string): Disciplina[] {
  const db = _getAppData();
  return db.disciplinas.filter((d) => d.instituicaoId === instId);
}

function addTurma(
  disciplinaId: string,
  nome: string,
  apelido: string
): Turma {
  const db = _getAppData();
  const t: Turma = {
    id: "turma_" + Date.now(),
    disciplinaId,
    nome,
    apelido,
  };
  db.turmas.push(t);
  _setAppData(db);
  return t;
}

function listTurmasByDisciplina(disciplinaId: string): Turma[] {
  const db = _getAppData();
  return db.turmas.filter((t) => t.disciplinaId === disciplinaId);
}

function deleteTurma(turmaId: string): void {
  const db = _getAppData();
  db.alunos = db.alunos.filter((a) => a.turmaId !== turmaId);
  db.notas = db.notas.filter((n) => {
    const aluno = db.alunos.find((a) => a.id === n.idAluno);
    return aluno && aluno.turmaId !== turmaId;
  });
  db.turmas = db.turmas.filter((t) => t.id !== turmaId);
  _setAppData(db);
}

// ==================== Alunos ====================
function addAluno(
  turmaId: string,
  matricula: string,
  nome: string
): Aluno {
  const db = _getAppData();
  const aluno: Aluno = {
    id: "aluno_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    turmaId,
    matricula,
    nome,
  };
  db.alunos.push(aluno);
  _setAppData(db);
  return aluno;
}

function listAlunosByTurma(turmaId: string): Aluno[] {
  const db = _getAppData();
  return db.alunos.filter((a) => a.turmaId === turmaId);
}

function importCSVToTurma(turmaId: string, csvText: string): void {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== "");
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 2) continue;
    const matricula = cols[0].trim();
    const nome = cols[1].trim();
    if (!matricula || !nome) continue;
    const db = _getAppData();
    const exists = db.alunos.find(
      (a) => a.turmaId === turmaId && a.matricula === matricula
    );
    if (!exists) {
      addAluno(turmaId, matricula, nome);
    }
  }
}

// ==================== Componentes ====================
function addComponente(
  disciplinaId: string,
  nome: string,
  sigla: string,
  descricao: string
): Componente {
  const db = _getAppData();
  const comp: Componente = {
    id: "comp_" + Date.now(),
    disciplinaId,
    nome,
    sigla,
    descricao,
  };
  db.componentes.push(comp);
  _setAppData(db);
  return comp;
}

function listComponentesByDisciplina(disciplinaId: string): Componente[] {
  const db = _getAppData();
  return db.componentes.filter((c) => c.disciplinaId === disciplinaId);
}

// ==================== Notas ====================
function setNotaValor(
  idAluno: string,
  idComponente: string,
  valor: number
): void {
  const db = _getAppData();
  let nota = db.notas.find(
    (n) => n.idAluno === idAluno && n.idComponente === idComponente
  );
  if (!nota) {
    nota = { idAluno, idComponente, valor };
    db.notas.push(nota);
  } else {
    nota.valor = valor;
  }
  _setAppData(db);
}

function getNotaValor(idAluno: string, idComponente: string): string | number {
  const db = _getAppData();
  const nota = db.notas.find(
    (n) => n.idAluno === idAluno && n.idComponente === idComponente
  );
  return nota ? nota.valor : "";
}

// ==================== Vínculos ====================
function getTurma(turmaId: string): Turma | undefined {
  const db = _getAppData();
  return db.turmas.find((t) => t.id === turmaId);
}

function getDisciplinaById(discId: string): Disciplina | undefined {
  const db = _getAppData();
  return db.disciplinas.find((d) => d.id === discId);
}

function getInstituicaoById(instId: string): Instituicao | undefined {
  const db = _getAppData();
  return db.instituicoes.find((i) => i.id === instId);
}

// ==================== Exportar CSV ====================
function exportTurmaCSV(turmaId: string): void {
  const turma = getTurma(turmaId);
  const disciplina = turma ? getDisciplinaById(turma.disciplinaId) : null;
  const comps = disciplina ? listComponentesByDisciplina(disciplina.id) : [];

  const alunos = listAlunosByTurma(turmaId);
  let header = ["Matricula", "Nome"];
  comps.forEach((c) => header.push(c.sigla));
  header.push("MediaFinal");

  const rows: string[] = [header.join(",")];

  alunos.forEach((al) => {
    const cols: string[] = [al.matricula, al.nome];
    let soma = 0;
    let count = 0;
    comps.forEach((c) => {
      const v = getNotaValor(al.id, c.id);
      const num = v !== "" ? parseFloat(v as string) : NaN;
      cols.push(isNaN(num) ? "" : num.toFixed(2));
      if (!isNaN(num)) {
        soma += num;
        count++;
      }
    });
    const media = (count > 0 ? soma / count : 0).toFixed(2);
    cols.push(media);
    rows.push(cols.join(","));
  });

  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  const agora = new Date();
  const nomeArquivo =
    agora.toISOString().slice(0, 19).replace(/[:T]/g, "-") +
    "-" +
    (turma ? turma.nome : "Turma") +
    "-" +
    (disciplina ? disciplina.sigla : "disc") +
    ".csv";

  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}
