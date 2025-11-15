// src/pages/turma.ts
import { requireAuth, handleLogoutBtn } from "../core/auth";
import { getTurma } from "../data/turma";
import { getDisciplinaById, listComponentesByDisciplina } from "../data/disciplina.ts";
import { listAlunosByTurma, importCSVToTurma, addAluno } from "../data/aluno";
import { addComponente, listComponentesByDisciplina as listComps } from "../data/componente";
import { getNotaValor, setNotaValor, exportTurmaCSVContent } from "../data/nota";
import { getInstituicaoById } from "../data/instituicao";

let turmaAtual = null as (ReturnType<typeof getTurma>);
let disciplinaAtual = null as (ReturnType<typeof getDisciplinaById>);
let componentesDaDisciplina: ReturnType<typeof listComps> = [];

function getQueryParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderHeaderInfo(): void {
  const turmaInfo = document.getElementById("turmaInfo");
  if (!turmaInfo || !disciplinaAtual || !turmaAtual) return;
  const inst = getInstituicaoById(disciplinaAtual.instituicaoId);
  turmaInfo.innerHTML = `
    <div><strong>Instituição:</strong> ${inst?.nomeInstituicao ?? ""}</div>
    <div><strong>Curso:</strong> ${inst?.nomeCurso ?? ""}</div>
    <div><strong>Disciplina:</strong> ${disciplinaAtual.nome} (${disciplinaAtual.sigla})</div>
    <div><strong>Turma:</strong> ${turmaAtual.nome} (${turmaAtual.apelido ?? ""})</div>
  `;
}

function renderComponentesSelect(): void {
  const sel = document.getElementById("selectComponenteNotas") as HTMLSelectElement | null;
  if (!sel) return;
  sel.innerHTML = "";
  componentesDaDisciplina.forEach(c => {
    const o = document.createElement("option");
    o.value = c.id;
    o.textContent = `${c.nome} (${c.sigla})`;
    sel.appendChild(o);
  });
}

function renderTabelaNotas(): void {
  const tableWrapper = document.getElementById("areaNotas");
  if (!tableWrapper || !turmaAtual || !disciplinaAtual) return;
  const alunos = listAlunosByTurma(turmaAtual.id);
  const comps = componentesDaDisciplina;
  let html = `<table><thead><tr><th>Matrícula</th><th>Nome</th>`;
  comps.forEach(c => html += `<th>${c.sigla}</th>`);
  html += `<th>Média Final</th></tr></thead><tbody>`;
  alunos.forEach(al => {
    html += `<tr data-aluno="${al.id}"><td>${al.matricula}</td><td>${al.nome}</td>`;
    let soma = 0;
    let count = 0;
    comps.forEach(c => {
      const valor = getNotaValor(al.id, c.id);
      const num = valor !== "" ? Number(valor) : NaN;
      if (!isNaN(num)) { soma += num; count++; }
      html += `<td><input type="number" min="0" max="10" step="0.01" data-comp="${c.id}" value="${valor ?? ""}"/></td>`;
    });
    const media = count > 0 ? (soma / count).toFixed(2) : "0.00";
    html += `<td>${media}</td></tr>`;
  });
  html += `</tbody></table>
    <div class="notice">Importante: você só pode editar UM componente por vez.</div>
    <div style="margin-top:12px;">
      <label for="selectComponenteNotas">Componente que estou editando agora:</label>
      <select id="selectComponenteNotas"></select>
      <button id="btnSalvarComponente">Salvar notas do componente</button>
    </div>`;
  tableWrapper.innerHTML = html;
  renderComponentesSelect();

  const btnSalvar = document.getElementById("btnSalvarComponente") as HTMLButtonElement | null;
  const sel = document.getElementById("selectComponenteNotas") as HTMLSelectElement | null;
  if (!btnSalvar || !sel) return;
  btnSalvar.addEventListener("click", () => {
    const compId = sel.value;
    const linhas = tableWrapper.querySelectorAll<HTMLTableRowElement>("tbody tr");
    linhas.forEach(linha => {
      const alunoId = linha.getAttribute("data-aluno");
      if (!alunoId) return;
      const inp = linha.querySelector<HTMLInputElement>(`input[data-comp="${compId}"]`);
      if (!inp) return;
      const v = inp.value.trim();
      if (v !== "" && !isNaN(Number(v))) {
        setNotaValor(alunoId, compId, Number(v));
      } else {
        setNotaValor(alunoId, compId, "");
      }
    });
    // re-render
    componentesDaDisciplina = listComps(disciplinaAtual!.id);
    renderTabelaNotas();
  });
}

function renderListaComponentes(): void {
  const compList = document.getElementById("listaComponentes");
  if (!compList) return;
  compList.innerHTML = "";
  componentesDaDisciplina.forEach(c => {
    const div = document.createElement("div");
    div.className = "card-item";
    div.innerHTML = `
      <strong>${c.nome} (${c.sigla})</strong>
      <small>${c.descricao ?? ""}</small>
      <div style="margin-top:4px;font-size:12px;color:#555;">ID: ${c.id}</div>
    `;
    compList.appendChild(div);
  });
}

function setupFormsTurma(): void {
  if (!turmaAtual || !disciplinaAtual) return;
  const fAluno = document.getElementById("formAluno") as HTMLFormElement | null;
  if (fAluno) {
    fAluno.addEventListener("submit", e => {
      e.preventDefault();
      const matricula = (fAluno.querySelector<HTMLInputElement>("[name='matricula']")?.value ?? "").trim();
      const nome = (fAluno.querySelector<HTMLInputElement>("[name='nome']")?.value ?? "").trim();
      if (!matricula || !nome) return;
      addAluno(turmaAtual.id, matricula, nome);
      fAluno.reset();
      renderTabelaNotas();
    });
  }

  const fCSV = document.getElementById("formImportCSV") as HTMLFormElement | null;
  if (fCSV) {
    fCSV.addEventListener("submit", e => {
      e.preventDefault();
      const fileInput = document.getElementById("csvFile") as HTMLInputElement | null;
      const file = fileInput?.files?.[0];
      if (!file) {
        alert("Selecione um arquivo CSV primeiro.");
        return;
      }
      const reader = new FileReader();
      reader.onload = evt => {
        const text = evt.target?.result;
        if (typeof text === "string") {
          importCSVToTurma(turmaAtual!.id, text).then(() => renderTabelaNotas());
        }
      };
      reader.readAsText(file);
      if (fileInput) fileInput.value = "";
    });
  }

  const fComp = document.getElementById("formComponente") as HTMLFormElement | null;
  if (fComp) {
    fComp.addEventListener("submit", e => {
      e.preventDefault();
      const nome = (fComp.querySelector<HTMLInputElement>("[name='nomeComp']")?.value ?? "").trim();
      const sigla = (fComp.querySelector<HTMLInputElement>("[name='sigla']")?.value ?? "").trim();
      const descricao = (fComp.querySelector<HTMLInputElement>("[name='descricao']")?.value ?? "").trim();
      addComponente(disciplinaAtual!.id, nome, sigla, descricao);
      fComp.reset();
      componentesDaDisciplina = listComps(disciplinaAtual!.id);
      renderListaComponentes();
      renderTabelaNotas();
    });
  }

  const btnExport = document.getElementById("btnExportCSV") as HTMLButtonElement | null;
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const alunos = listAlunosByTurma(turmaAtual!.id);
      const comps = listComps(disciplinaAtual!.id);
      let pode = true;
      alunos.forEach(a => comps.forEach(c => {
        const v = getNotaValor(a.id, c.id);
        if (v === "" || v === undefined) { pode = false; }
      }));
      if (!pode) {
        alert("Para exportar: todas as notas precisam estar lançadas para todos os alunos.");
        return;
      }
      const csv = exportTurmaCSVContent(turmaAtual!.id);
      // cria blob e download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const agora = new Date();
      a.href = url;
      a.download = agora.toISOString().slice(0,19).replace(/[:T]/g,"-") + "-" + (turmaAtual!.nome || "Turma") + ".csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

export function initTurma(): void {
  requireAuth();
  handleLogoutBtn();
  const turmaId = getQueryParam("turmaId");
  if (!turmaId) {
    alert("Turma inválida.");
    window.location.href = "dashboard.html";
    return;
  }
  turmaAtual = getTurma(turmaId);
  if (!turmaAtual) {
    alert("Turma não encontrada");
    window.location.href = "dashboard.html";
    return;
  }
  disciplinaAtual = getDisciplinaById(turmaAtual.disciplinaId);
  if (!disciplinaAtual) {
    alert("Disciplina não encontrada");
    return;
  }
  componentesDaDisciplina = listComps(disciplinaAtual.id);
  renderHeaderInfo();
  renderListaComponentes();
  renderTabelaNotas();
  setupFormsTurma();
}

document.addEventListener("DOMContentLoaded", initTurma);
