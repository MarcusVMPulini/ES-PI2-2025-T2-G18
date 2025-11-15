// src/pages/painelDocente.ts
import { requireAuth, getCurrentUser, handleLogoutBtn } from "../core/auth.ts";
import { addInstituicao, listInstituicoesByUser, getInstituicaoById } from "../data/instituicao.ts";
import { addDisciplina, listDisciplinasByInstituicao } from "../data/disciplina.ts";
import { addTurma, listTurmasByDisciplina, deleteTurma } from "../data/turma.ts";
import { addAluno, listAlunosByTurma, importCSVToTurma } from "../data/aluno.ts";
import { addComponente, listComponentesByDisciplina } from "../data/componente.ts";
import { getNotaValor, setNotaValor, exportTurmaCSVContent } from "../data/nota.ts";

function renderUserInfo() {
  const el = document.getElementById("userInfo");
  const user = getCurrentUser();
  if (el && user) el.textContent = `Olá, ${user.nome} (${user.email})`;
}

/* Implementações de populateInstituicoes, renderDisciplinas, renderTurmas etc.
   -> use as funções importadas acima. Para não alongar aqui, copie a lógica
   do seu painel antigo mas substitua chamadas locais por chamadas das funções
   importadas (por exemplo: listInstituicoesByUser() já disponível).
*/

export function initPainelDocente(): void {
  requireAuth();
  renderUserInfo();
  handleLogoutBtn();
  // chamadas iniciais:
  // populateInstituicoes();
  // setupForms();
}

// auto-run
document.addEventListener("DOMContentLoaded", initPainelDocente);
