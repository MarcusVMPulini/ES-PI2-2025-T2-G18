// ========== Tipos ==========
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

// ========== Variáveis globais ==========
let turmaAtual: Turma | null = null;
let disciplinaAtual: Disciplina | null = null;
let componentesDaDisciplina: Componente[] = [];

// ========== Funções utilitárias ==========
function getQueryParam(name: string): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// ========== Renderizações ==========
function renderHeaderInfo(): void {
    const turmaInfo = document.getElementById("turmaInfo");
    if (!turmaInfo || !disciplinaAtual) return;

    const inst = getInstituicaoById(disciplinaAtual.instituicaoId);
    turmaInfo.innerHTML = `
        <div><strong>Instituição:</strong> ${inst ? inst.nomeInstituicao : ""}</div>
        <div><strong>Curso:</strong> ${inst ? inst.nomeCurso : ""}</div>
        <div><strong>Disciplina:</strong> ${disciplinaAtual.nome} (${disciplinaAtual.sigla})</div>
        <div><strong>Turma:</strong> ${turmaAtual ? turmaAtual.nome : ""} (${turmaAtual ? turmaAtual.apelido : ""})</div>
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

    let html = `<table>
        <thead>
            <tr>
                <th>Matrícula</th>
                <th>Nome</th>`;

    comps.forEach(c => {
        html += `<th>${c.sigla}</th>`;
    });

    html += `<th>Média Final</th></tr></thead><tbody>`;

    alunos.forEach(al => {
        html += `<tr data-aluno="${al.id}">
            <td>${al.matricula}</td>
            <td>${al.nome}</td>`;

        let soma = 0;
        let count = 0;

        comps.forEach(c => {
            const valor = getNotaValor(al.id, c.id);
            const num = valor !== "" ? parseFloat(valor) : NaN;
            if (!isNaN(num)) {
                soma += num;
                count++;
            }
            html += `
                <td>
                    <input 
                        type="number" 
                        min="0" max="10" step="0.01"
                        data-comp="${c.id}" 
                        value="${valor !== "" ? valor : ""}"
                    />
                </td>`;
        });

        const media = count > 0 ? (soma / count).toFixed(2) : "0.00";
        html += `<td>${media}</td></tr>`;
    });

    html += `</tbody></table>
    <div class="notice">
        Importante: você só pode editar UM componente por vez no salvamento.<br>
        Selecione abaixo qual componente está atualizando agora e clique "Salvar notas do componente".
    </div>
    <div style="margin-top:12px;">
        <label for="selectComponenteNotas">Componente que estou editando agora:</label>
        <select id="selectComponenteNotas"></select>
        <button id="btnSalvarComponente">Salvar notas do componente</button>
    </div>`;

    tableWrapper.innerHTML = html;
    renderComponentesSelect();

    const btnSalvar = document.getElementById("btnSalvarComponente") as HTMLButtonElement | null;
    if (!btnSalvar) return;

    btnSalvar.addEventListener("click", () => {
        const sel = document.getElementById("selectComponenteNotas") as HTMLSelectElement;
        const compId = sel.value;
        const linhas = tableWrapper.querySelectorAll<HTMLTableRowElement>("tbody tr");

        linhas.forEach(linha => {
            const alunoId = linha.getAttribute("data-aluno");
            if (!alunoId) return;
            const inp = linha.querySelector<HTMLInputElement>(`input[data-comp="${compId}"]`);
            if (inp) {
                const v = inp.value.trim();
                if (v !== "") {
                    const num = parseFloat(v);
                    if (!isNaN(num)) {
                        setNotaValor(alunoId, compId, num);
                    }
                } else {
                    setNotaValor(alunoId, compId, "");
                }
            }
        });
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
            <small>${c.descricao}</small>
            <div style="margin-top:4px;font-size:12px;color:#555;">ID: ${c.id}</div>
        `;
        compList.appendChild(div);
    });
}

// ========== Formulários ==========
function setupFormsTurma(): void {
    if (!turmaAtual || !disciplinaAtual) return;

    const fAluno = document.getElementById("formAluno") as HTMLFormElement | null;
    if (fAluno) {
        fAluno.addEventListener("submit", e => {
            e.preventDefault();
            const matricula = (fAluno.querySelector<HTMLInputElement>("[name='matricula']")?.value || "").trim();
            const nome = (fAluno.querySelector<HTMLInputElement>("[name='nome']")?.value || "").trim();
            addAluno(turmaAtual.id, matricula, nome);
            fAluno.reset();
            renderTabelaNotas();
        });
    }

    const fCSV = document.getElementById("formImportCSV") as HTMLFormElement | null;
    if (fCSV) {
        fCSV.addEventListener("submit", e => {
            e.preventDefault();
            const fileInput = document.getElementById("csvFile") as HTMLInputElement;
            const file = fileInput.files?.[0];
            if (!file) {
                alert("Selecione um arquivo CSV primeiro.");
                return;
            }
            const reader = new FileReader();
            reader.onload = evt => {
                importCSVToTurma(turmaAtual.id, evt.target?.result as string);
                renderTabelaNotas();
            };
            reader.readAsText(file);
            fileInput.value = "";
        });
    }

    const fComp = document.getElementById("formComponente") as HTMLFormElement | null;
    if (fComp) {
        fComp.addEventListener("submit", e => {
            e.preventDefault();
            const nome = (fComp.querySelector<HTMLInputElement>("[name='nomeComp']")?.value || "").trim();
            const sigla = (fComp.querySelector<HTMLInputElement>("[name='sigla']")?.value || "").trim();
            const descricao = (fComp.querySelector<HTMLInputElement>("[name='descricao']")?.value || "").trim();
            addComponente(disciplinaAtual.id, nome, sigla, descricao);
            fComp.reset();
            componentesDaDisciplina = listComponentesByDisciplina(disciplinaAtual.id);
            renderListaComponentes();
            renderTabelaNotas();
        });
    }

    const btnExport = document.getElementById("btnExportCSV") as HTMLButtonElement | null;
    if (btnExport) {
        btnExport.addEventListener("click", () => {
            const alunos = listAlunosByTurma(turmaAtual.id);
            const comps = listComponentesByDisciplina(disciplinaAtual.id);
            let pode = true;

            alunos.forEach(a => {
                comps.forEach(c => {
                    const v = getNotaValor(a.id, c.id);
                    if (v === "" || v === undefined) {
                        pode = false;
                    }
                });
            });

            if (!pode) {
                alert("Para exportar: todas as notas precisam estar lançadas para todos os alunos.");
                return;
            }

            exportTurmaCSV(turmaAtual.id);
        });
    }
}

// ========== Inicialização ==========
function initTurma(): void {
    requireAuth();
    handleLogoutBtn();

    const turmaId = getQueryParam("turmaId");
    turmaAtual = turmaId ? getTurma(turmaId) : null;
    if (!turmaAtual) {
        alert("Turma não encontrada");
        window.location.href = "dashboard.html";
        return;
    }

    disciplinaAtual = getDisciplinaById(turmaAtual.disciplinaId);
    componentesDaDisciplina = listComponentesByDisciplina(disciplinaAtual.id);

    renderHeaderInfo();
    renderListaComponentes();
    renderTabelaNotas();
    setupFormsTurma();
}

document.addEventListener("DOMContentLoaded", initTurma);
