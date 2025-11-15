// ====================== IMPORTS =========================
import { User } from "../core/types";
import { requireAuth, handleLogoutBtn } from "../core/auth";

import {
  listInstituicoesByUser,
  addInstituicao
} from "../data/instituicao";

import {
  listDisciplinasByInstituicao,
  addDisciplina
} from "../data/disciplina";

import {
  listTurmasByDisciplina,
  addTurma,
  deleteTurma
} from "../data/turma";

// ====================== USER INFO =========================

function renderUserInfo(user: User): void {
  const el = document.getElementById("userInfo");
  if (el) {
    el.textContent = `Olá, ${user.nome} (${user.email})`;
  }
}

// ====================== POPULAR INSTITUIÇÕES =========================

function populateInstituicoes(): void {
  const list = document.getElementById("listaInstituicoes");
  const selInstDisc = document.getElementById("disc_instituicao") as HTMLSelectElement | null;
  const selInstTurma = document.getElementById("turma_instituicao") as HTMLSelectElement | null;
  const selDiscTurma = document.getElementById("turma_disciplina") as HTMLSelectElement | null;

  const containerDisciplinas = document.getElementById("listaDisciplinas");
  const containerTurmas = document.getElementById("listaTurmas");

  if (list) list.innerHTML = "";
  if (selInstDisc) selInstDisc.innerHTML = "";
  if (selInstTurma) selInstTurma.innerHTML = "";
  if (selDiscTurma) selDiscTurma.innerHTML = "";
  if (containerDisciplinas) containerDisciplinas.innerHTML = "";
  if (containerTurmas) containerTurmas.innerHTML = "";

  const instituicoes = listInstituicoesByUser();

  instituicoes.forEach(inst => {
    // lista lateral
    if (list) {
      const div = document.createElement("div");
      div.className = "card-item";
      div.innerHTML = `
        <strong>${inst.nomeInstituicao}</strong>
        <small>Curso: ${inst.nomeCurso}</small>
        <div style="margin-top:4px;font-size:12px;color:#555;">
          ID: ${inst.id}
        </div>
      `;
      list.appendChild(div);
    }

    // selects
    if (selInstDisc) {
      const o = document.createElement("option");
      o.value = inst.id;
      o.textContent = `${inst.nomeInstituicao} / ${inst.nomeCurso}`;
      selInstDisc.appendChild(o);
    }

    if (selInstTurma) {
      const o2 = document.createElement("option");
      o2.value = inst.id;
      o2.textContent = `${inst.nomeInstituicao} / ${inst.nomeCurso}`;
      selInstTurma.appendChild(o2);
    }
  });

  // Render disciplinas ao mudar instituição
  if (selInstDisc) {
    selInstDisc.addEventListener("change", () => {
      renderDisciplinas(selInstDisc.value);
    });

    if (selInstDisc.value) {
      renderDisciplinas(selInstDisc.value);
    }
  }

  // Atualizar disciplinas ao mudar instituição do form de turma
  if (selInstTurma) {
    selInstTurma.addEventListener("change", () => {
      fillDisciplinaFromInstituicao(selInstTurma.value);
    });

    if (selInstTurma.value) {
      fillDisciplinaFromInstituicao(selInstTurma.value);
    }
  }

  // ==================== FUNÇÕES INTERNAS =======================

  function fillDisciplinaFromInstituicao(instId: string): void {
    if (!selDiscTurma) return;

    selDiscTurma.innerHTML = "";
    const discs = listDisciplinasByInstituicao(instId);

    discs.forEach(d => {
      const o = document.createElement("option");
      o.value = d.id;
      o.textContent = `${d.nome} (${d.sigla})`;
      selDiscTurma.appendChild(o);
    });

    renderTurmas(selDiscTurma.value);

    selDiscTurma.addEventListener("change", () => {
      renderTurmas(selDiscTurma.value);
    });
  }

  function renderDisciplinas(instId: string): void {
    if (!containerDisciplinas) return;
    containerDisciplinas.innerHTML = "";

    const discs = listDisciplinasByInstituicao(instId);

    discs.forEach(d => {
      const box = document.createElement("div");
      box.className = "card-item";
      box.innerHTML = `
        <strong>${d.nome} (${d.sigla})</strong>
        <small>Código: ${d.codigo} | Período: ${d.periodo}</small>
        <div style="margin-top:4px;font-size:12px;color:#555;">ID: ${d.id}</div>
      `;
      containerDisciplinas.appendChild(box);
    });
  }

  function renderTurmas(discId: string): void {
    if (!containerTurmas) return;
    containerTurmas.innerHTML = "";

    const turmas = listTurmasByDisciplina(discId);

    turmas.forEach(t => {
      const box = document.createElement("div");
      box.className = "card-item";
      box.innerHTML = `
        <strong>${t.nome}</strong>
        <small>Apelido: ${t.apelido}</small>
        <div style="margin-top:4px;font-size:12px;color:#555;">ID: ${t.id}</div>
        <div style="margin-top:8px;">
          <a class="inline" href="turma.html?turmaId=${t.id}" style="font-size:12px;">Abrir turma</a>
          <button class="small danger" data-del="${t.id}">Excluir turma</button>
        </div>
      `;
      containerTurmas.appendChild(box);
    });

    // excluir turma
    containerTurmas
      .querySelectorAll<HTMLButtonElement>("button[data-del]")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          const tid = btn.getAttribute("data-del");
          if (!tid) return;

          const ok = confirm("Tem certeza que deseja excluir esta turma? Esta ação é irreversível.");
          if (ok) {
            deleteTurma(tid);
            renderTurmas(discId);
          }
        });
      });
  }
}

// ====================== FORMULÁRIOS =========================

function setupForms(): void {
  // instituição
  const f1 = document.getElementById("formInstituicao") as HTMLFormElement | null;
  if (f1) {
    f1.addEventListener("submit", e => {
      e.preventDefault();

      const nomeInstituicao = (f1.querySelector<HTMLInputElement>("[name='nomeInstituicao']")?.value ?? "").trim();
      const nomeCurso = (f1.querySelector<HTMLInputElement>("[name='nomeCurso']")?.value ?? "").trim();

      addInstituicao(nomeInstituicao, nomeCurso);
      f1.reset();
      populateInstituicoes();
    });
  }

  // disciplina
  const f2 = document.getElementById("formDisciplina") as HTMLFormElement | null;
  if (f2) {
    f2.addEventListener("submit", e => {
      e.preventDefault();

      const instId = (f2.querySelector<HTMLSelectElement>("[name='instituicao']")?.value ?? "").trim();
      const nome = (f2.querySelector<HTMLInputElement>("[name='nome']")?.value ?? "").trim();
      const sigla = (f2.querySelector<HTMLInputElement>("[name='sigla']")?.value ?? "").trim();
      const codigo = (f2.querySelector<HTMLInputElement>("[name='codigo']")?.value ?? "").trim();
      const periodo = (f2.querySelector<HTMLInputElement>("[name='periodo']")?.value ?? "").trim();

      addDisciplina(instId, nome, sigla, codigo, periodo);
      f2.reset();
      populateInstituicoes();
    });
  }

  // turma
  const f3 = document.getElementById("formTurma") as HTMLFormElement | null;
  if (f3) {
    f3.addEventListener("submit", e => {
      e.preventDefault();

      const discId = (f3.querySelector<HTMLSelectElement>("[name='disciplina']")?.value ?? "").trim();
      const nomeTurma = (f3.querySelector<HTMLInputElement>("[name='nomeTurma']")?.value ?? "").trim();
      const apelido = (f3.querySelector<HTMLInputElement>("[name='apelido']")?.value ?? "").trim();

      addTurma(discId, nomeTurma, apelido);
      f3.reset();
      populateInstituicoes();
    });
  }
}

// ====================== INICIALIZAÇÃO =========================

function initDashboard(): void {
  const user = requireAuth();
  renderUserInfo(user);
  setupForms();
  populateInstituicoes();
  handleLogoutBtn();
}

document.addEventListener("DOMContentLoaded", initDashboard);
