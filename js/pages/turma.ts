// src/pages/turma.ts

// ---------- Imports (ajuste os caminhos conforme seu projeto) ----------
import { requireAuth, handleLogoutBtn } from "../core/auth";
import { getTurma } from "../data/turma";
import { getDisciplinaById } from "../data/disciplina";
import { getInstituicaoById } from "../data/instituicao";
import { listAlunosByTurma, addAluno, importCSVToTurma } from "../data/aluno";
import { addComponente } from "../data/componente";
import { getNotaValor, setNotaValor, exportTurmaCSVContent } from "../data/nota";
import {listComponentesByDisciplina} from "../data/componente.ts"

// ---------- Tipos locais (redundantes com core/types, mas práticos aqui) ----------
interface Instituicao { id: string; nomeInstituicao: string; nomeCurso: string; }
interface Disciplina { id: string; instituicaoId: string; nome: string; sigla: string; codigo?: string; periodo?: string; }
interface Turma { id: string; disciplinaId: string; nome: string; apelido?: string; }
interface Aluno { id: string; turmaId: string; matricula: string; nome: string; }
interface Componente { id: string; disciplinaId: string; nome: string; sigla: string; descricao?: string; }

// ---------- State/cache ----------
let turmaAtual: Turma | null = null;
let disciplinaAtual: Disciplina | null = null;
let componentesDaDisciplina: Componente[] = [];

// DOM cached nodes
let $turmaInfo: HTMLElement | null = null;
let $listaComponentes: HTMLElement | null = null;
let $areaNotas: HTMLElement | null = null;
let $formAluno: HTMLFormElement | null = null;
let $formCSV: HTMLFormElement | null = null;
let $fileInput: HTMLInputElement | null = null;
let $formComponente: HTMLFormElement | null = null;
let $btnExportCSV: HTMLButtonElement | null = null;
let $selectComponenteNotas: HTMLSelectElement | null = null;
let $btnSalvarComponente: HTMLButtonElement | null = null;

// ---------- Utilitários ----------
function getQueryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function toNumberSafe(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---------- Render helpers ----------
function renderHeaderInfo(): void {
  if (!$turmaInfo || !turmaAtual || !disciplinaAtual) return;
  const inst = getInstituicaoById(disciplinaAtual.instituicaoId);
  $turmaInfo.innerHTML = `
    <div><strong>Instituição:</strong> ${inst?.nomeInstituicao ?? ""}</div>
    <div><strong>Curso:</strong> ${inst?.nomeCurso ?? ""}</div>
    <div><strong>Disciplina:</strong> ${disciplinaAtual.nome} (${disciplinaAtual.sigla})</div>
    <div><strong>Turma:</strong> ${turmaAtual.nome} ${turmaAtual.apelido ? `(${turmaAtual.apelido})` : ""}</div>
  `;
}

function renderListaComponentes(): void {
  if (!$listaComponentes) return;
  $listaComponentes.innerHTML = "";
  if (!componentesDaDisciplina.length) {
    $listaComponentes.textContent = "Nenhum componente cadastrado.";
    return;
  }
  const frag = document.createDocumentFragment();
  componentesDaDisciplina.forEach(c => {
    const div = document.createElement("div");
    div.className = "card-item";
    div.innerHTML = `
      <strong>${c.nome} (${c.sigla})</strong>
      <small>${c.descricao ?? ""}</small>
      <div style="margin-top:4px;font-size:12px;color:#555;">ID: ${c.id}</div>
    `;
    frag.appendChild(div);
  });
  $listaComponentes.appendChild(frag);
}

function renderComponentesSelect(): void {
  if (!$selectComponenteNotas) return;
  $selectComponenteNotas.innerHTML = "";
  componentesDaDisciplina.forEach(c => {
    const o = document.createElement("option");
    o.value = c.id;
    o.textContent = `${c.nome} (${c.sigla})`;
    $selectComponenteNotas!.appendChild(o);
  });
}

/**
 * Renderiza a tabela de notas completa.
 * Estratégia: cria HTML do tbody e substitui apenas o tbody para reduzir repaints.
 */
function renderTabelaNotas(): void {
  if (!$areaNotas || !turmaAtual || !disciplinaAtual) return;

  const alunos = listAlunosByTurma(turmaAtual.id);
  const comps = componentesDaDisciplina;

  // Cabeçalho
  let html = `<table><thead><tr><th>Matrícula</th><th>Nome</th>`;
  for (const c of comps) html += `<th>${escapeHtml(c.sigla)}</th>`;
  html += `<th>Média Final</th></tr></thead><tbody>`;

  // Linhas
  for (const al of alunos) {
    html += `<tr data-aluno="${al.id}"><td>${escapeHtml(al.matricula)}</td><td>${escapeHtml(al.nome)}</td>`;
    let soma = 0;
    let count = 0;
    for (const c of comps) {
      const raw = getNotaValor(al.id, c.id);
      const num = raw === "" || raw === undefined ? NaN : Number(raw);
      if (!isNaN(num)) { soma += num; count++; }
      const v = (raw === "" || raw === undefined) ? "" : String(raw);
      html += `<td><input class="nota-input" type="number" min="0" max="10" step="0.01" data-comp="${c.id}" value="${escapeAttr(v)}"></td>`;
    }
    const media = (count > 0) ? (soma / count).toFixed(2) : "0.00";
    html += `<td class="media-cell">${media}</td></tr>`;
  }

  html += `</tbody></table>
    <div class="notice">Importante: você só pode editar UM componente por vez.</div>
    <div style="margin-top:12px;">
      <label for="selectComponenteNotas">Componente que estou editando agora:</label>
      <select id="selectComponenteNotas"></select>
      <button id="btnSalvarComponente">Salvar notas do componente</button>
    </div>`;

  // substitui o conteúdo
  $areaNotas.innerHTML = html;

  // re-cache selects/button dentro da área (eles são recriados)
  $selectComponenteNotas = document.getElementById("selectComponenteNotas") as HTMLSelectElement | null;
  $btnSalvarComponente = document.getElementById("btnSalvarComponente") as HTMLButtonElement | null;
  renderComponentesSelect();

  // manter listener de input via delegação (colocado em init)
}

// ---------- Event handlers (delegation) ----------

/**
 * Salva notas do componente selecionado.
 * Percorre linhas e pega input[data-comp="{compId}"] em cada linha.
 */
function handleSalvarComponente(): void {
  if (!$selectComponenteNotas || !turmaAtual) return;
  const compId = $selectComponenteNotas.value;
  if (!compId) {
    alert("Selecione um componente para salvar.");
    return;
  }
  // pega todas as linhas
  const linhas = $areaNotas?.querySelectorAll<HTMLTableRowElement>("tbody tr") ?? [];
  for (const linha of Array.from(linhas)) {
    const alunoId = linha.getAttribute("data-aluno");
    if (!alunoId) continue;
    const inp = linha.querySelector<HTMLInputElement>(`input[data-comp="${compId}"]`);
    if (!inp) continue;
    const raw = inp.value.trim();
    const n = toNumberSafe(raw);
    // aceita string "" para apagar nota
    if (raw === "") {
      setNotaValor(alunoId, compId, "");
    } else if (n !== null) {
      // limites
      if (n < 0 || n > 10) {
        // não salva e mostra alerta
        alert(`Valor inválido para aluno ${alunoId}: ${raw}. Deve ser entre 0 e 10.`);
        continue;
      }
      setNotaValor(alunoId, compId, n);
    } else {
      // não numérico
      alert(`Valor inválido: ${raw}`);
    }
  }

  // re-render tabela (recalcula médias)
  componentesDaDisciplina = listComponentesByDisciplina(disciplinaAtual!.id);
  renderTabelaNotas();
}

/**
 * Event delegation for inputs: updates media cell in the row live when the user types.
 * We'll update only the media cell visually, actual save occurs on "Salvar notas".
 */
function handleInputEvent(e: Event): void {
  const target = e.target as HTMLElement | null;
  if (!target || !(target instanceof HTMLInputElement)) return;
  if (!target.classList.contains("nota-input")) return;
  const row = target.closest("tr");
  if (!row) return;

  // compute row's average based on current values in inputs
  const inputs = Array.from(row.querySelectorAll<HTMLInputElement>("input.nota-input"));
  let soma = 0;
  let count = 0;
  for (const inp of inputs) {
    const v = inp.value.trim();
    const n = toNumberSafe(v);
    if (n !== null) { soma += n; count++; }
  }
  const media = count > 0 ? (soma / count).toFixed(2) : "0.00";
  const mediaCell = row.querySelector<HTMLTableCellElement>(".media-cell");
  if (mediaCell) mediaCell.textContent = media;
}

// ---------- Small helpers ----------
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" } as Record<string,string>)[m]);
}
function escapeAttr(s: string): string {
  return s.replace(/["']/g, m => (m === '"' ? "&quot;" : "&#39;"));
}

// ---------- Forms and buttons handlers ----------
function setupForms(): void {
  // add aluno
  if ($formAluno) {
    $formAluno.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const m = ($formAluno.querySelector<HTMLInputElement>("[name='matricula']")?.value ?? "").trim();
      const nome = ($formAluno.querySelector<HTMLInputElement>("[name='nome']")?.value ?? "").trim();
      if (!m || !nome || !turmaAtual) return;
      addAluno(turmaAtual.id, m, nome);
      $formAluno.reset();
      renderTabelaNotas();
    });
  }

  // import CSV
  if ($formCSV && $fileInput) {
    $formCSV.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const f = $fileInput.files?.[0];
      if (!f || !turmaAtual) { alert("Selecione um arquivo."); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const txt = reader.result;
        if (typeof txt === "string") {
          importCSVToTurma(turmaAtual.id, txt).then(() => renderTabelaNotas());
        }
      };
      reader.readAsText(f);
      $fileInput.value = "";
    });
  }

  // add componente
  if ($formComponente!=null) {
    $formComponente.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (!disciplinaAtual) return;
      const nome = ($formComponente.querySelector<HTMLInputElement>("[name='nomeComp']")?.value ?? "").trim();
      const sigla = ($formComponente.querySelector<HTMLInputElement>("[name='sigla']")?.value ?? "").trim();
      const descricao = ($formComponente.querySelector<HTMLInputElement>("[name='descricao']")?.value ?? "").trim();
      if (!nome || !sigla) return;
      addComponente(disciplinaAtual.id, nome, sigla, descricao);
      $formComponente.reset();
      componentesDaDisciplina = listComponentesByDisciplina(disciplinaAtual.id);
      renderListaComponentes();
      renderTabelaNotas();
    });
  }

  // export CSV
  if ($btnExportCSV) {
    $btnExportCSV.addEventListener("click", () => {
      if (!turmaAtual || !disciplinaAtual) return;
      const alunos = listAlunosByTurma(turmaAtual.id);
      const comps = listComponentesByDisciplina(disciplinaAtual.id);
      for (const a of alunos) {
        for (const c of comps) {
          const v = getNotaValor(a.id, c.id);
          if (v === "" || v === undefined) {
            alert("Para exportar, todas as notas devem estar preenchidas.");
            return;
          }
        }
      }
      const csv = exportTurmaCSVContent(turmaAtual.id);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const agora = new Date();
      a.download = `${agora.toISOString().slice(0,19).replace(/[:T]/g,"-")}-${turmaAtual.nome || "Turma"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // save component button
  if ($btnSalvarComponente) {
    $btnSalvarComponente.addEventListener("click", handleSalvarComponente);
  }
}

// ---------- Init / bootstrap ----------
function cacheDom(): void {
  $turmaInfo = document.getElementById("turmaInfo");
  $listaComponentes = document.getElementById("listaComponentes");
  $areaNotas = document.getElementById("areaNotas");
  $formAluno = document.getElementById("formAluno") as HTMLFormElement | null;
  $formCSV = document.getElementById("formImportCSV") as HTMLFormElement | null;
  $fileInput = document.getElementById("csvFile") as HTMLInputElement | null;
  $formComponente = document.getElementById("formComponente") as HTMLFormElement | null;
  $btnExportCSV = document.getElementById("btnExportCSV") as HTMLButtonElement | null;
  // note: select/button inside areaNotas are created dynamically in renderTabelaNotas
  $selectComponenteNotas = document.getElementById("selectComponenteNotas") as HTMLSelectElement | null;
  $btnSalvarComponente = document.getElementById("btnSalvarComponente") as HTMLButtonElement | null;
}

function attachGlobalDelegation(): void {
  // delegation for inputs inside table
  document.addEventListener("input", handleInputEvent, true);
}

export function initTurmaPage(): void {
  requireAuth();
  handleLogoutBtn();

  cacheDom();
  attachGlobalDelegation();

  const turmaId = getQueryParam("turmaId");
  if (!turmaId) { alert("Turma inválida."); window.location.href = "dashboard.html"; return; }

  turmaAtual = getTurma(turmaId);
  if (!turmaAtual) { alert("Turma não encontrada."); window.location.href = "dashboard.html"; return; }

  disciplinaAtual = getDisciplinaById(turmaAtual.disciplinaId);
  if (!disciplinaAtual) { alert("Disciplina não encontrada."); return; }

  componentesDaDisciplina = listComponentesByDisciplina(disciplinaAtual.id);

  // render inicial
  renderHeaderInfo();
  renderListaComponentes();
  renderTabelaNotas();

  // cache newly created controls from renderTabelaNotas
  $selectComponenteNotas = document.getElementById("selectComponenteNotas") as HTMLSelectElement | null;
  $btnSalvarComponente = document.getElementById("btnSalvarComponente") as HTMLButtonElement | null;

  setupForms();
  // if save button exists, attach it
  if ($btnSalvarComponente) $btnSalvarComponente.addEventListener("click", handleSalvarComponente);
}

// auto-run
document.addEventListener("DOMContentLoaded", () => initTurmaPage());
