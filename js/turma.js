let turmaAtual = null;
let disciplinaAtual = null;
let componentesDaDisciplina = [];

function getQueryParam(name){
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function renderHeaderInfo(){
    const turmaInfo = document.getElementById("turmaInfo");
    if(!turmaInfo) return;

    const inst = getInstituicaoById(disciplinaAtual.instituicaoId);
    turmaInfo.innerHTML = `
        <div><strong>Instituição:</strong> ${inst ? inst.nomeInstituicao : ""}</div>
        <div><strong>Curso:</strong> ${inst ? inst.nomeCurso : ""}</div>
        <div><strong>Disciplina:</strong> ${disciplinaAtual.nome} (${disciplinaAtual.sigla})</div>
        <div><strong>Turma:</strong> ${turmaAtual.nome} (${turmaAtual.apelido})</div>
    `;
}

function renderComponentesSelect(){
    const sel = document.getElementById("selectComponenteNotas");
    if(!sel) return;
    sel.innerHTML = "";
    componentesDaDisciplina.forEach(c=>{
        const o = document.createElement("option");
        o.value = c.id;
        o.textContent = c.nome + " ("+c.sigla+")";
        sel.appendChild(o);
    });
}

function renderTabelaNotas(){
    const tableWrapper = document.getElementById("areaNotas");
    if(!tableWrapper) return;

    const alunos = listAlunosByTurma(turmaAtual.id);
    const comps = componentesDaDisciplina;

    // tabela com: Matrícula | Nome | cada componente | Média Final
    let html = `<table>
        <thead>
            <tr>
                <th>Matrícula</th>
                <th>Nome</th>`;

    comps.forEach(c=>{
        html += <th>${c.sigla}</th>;
    });
    html += <th>Média Final</th></tr></thead><tbody>;

    alunos.forEach(al=>{
        html += `<tr data-aluno="${al.id}">
            <td>${al.matricula}</td>
            <td>${al.nome}</td>`;
        let soma=0;
        let count=0;
        comps.forEach(c=>{
            const valor = getNotaValor(al.id,c.id);
            const num = valor!==""?parseFloat(valor):"";
            if(num!=="" && !isNaN(num)){
                soma+=num;
                count++;
            }
            html += `<td>
                <input 
                    type="number" 
                    min="0" max="10" step="0.01"
                    data-comp="${c.id}" 
                    value="${valor!==""?valor:""}"
                />
            </td>`;
        });
        const media = (count>0?(soma/count).toFixed(2):"0.00");
        html += <td>${media}</td>;
        html += </tr>;
    });

    html += `</tbody></table>
    <div class="notice">
        Importante: você só pode editar UM componente por vez no salvamento.
        Selecione abaixo qual componente está atualizando agora e clique "Salvar notas do componente".
    </div>
    <div style="margin-top:12px;">
        <label for="selectComponenteNotas">Componente que estou editando agora:</label>
        <select id="selectComponenteNotas"></select>
        <button id="btnSalvarComponente">Salvar notas do componente</button>
    </div>`;

    tableWrapper.innerHTML = html;
    renderComponentesSelect();

    // salvar notas de 1 componente por vez (requisito 3.5 simplificado) :contentReference[oaicite:4]{index=4}
    const btnSalvar = document.getElementById("btnSalvarComponente");
    btnSalvar.addEventListener("click", ()=>{
        const compId = document.getElementById("selectComponenteNotas").value;
        const linhas = tableWrapper.querySelectorAll("tbody tr");
        linhas.forEach(linha=>{
            const alunoId = linha.getAttribute("data-aluno");
            const inp = linha.querySelector(input[data-comp="${compId}"]);
            if(inp){
                const v = inp.value.trim();
                if(v!==""){
                    const num = parseFloat(v);
                    if(!isNaN(num)){
                        setNotaValor(alunoId, compId, num);
                    }
                } else {
                    // vazio significa sem nota
                    setNotaValor(alunoId, compId, "");
                }
            }
        });
        // re-render pra recalcular médias
        renderTabelaNotas();
    });
}

function renderListaComponentes(){
    const compList = document.getElementById("listaComponentes");
    if(!compList) return;
    compList.innerHTML = "";
    componentesDaDisciplina.forEach(c=>{
        const div = document.createElement("div");
        div.className="card-item";
        div.innerHTML = `
            <strong>${c.nome} (${c.sigla})</strong>
            <small>${c.descricao}</small>
            <div style="margin-top:4px;font-size:12px;color:#555;">ID: ${c.id}</div>
        `;
        compList.appendChild(div);
    });
}

function setupFormsTurma(){
    // adicionar aluno manual
    const fAluno = document.getElementById("formAluno");
    if(fAluno){
        fAluno.addEventListener("submit", e=>{
            e.preventDefault();
            const matricula = fAluno.matricula.value.trim();
            const nome = fAluno.nome.value.trim();
            addAluno(turmaAtual.id, matricula, nome);
            fAluno.reset();
            renderTabelaNotas();
        });
    }

    // importar CSV
    const fCSV = document.getElementById("formImportCSV");
    if(fCSV){
        fCSV.addEventListener("submit", e=>{
            e.preventDefault();
            const fileInput = document.getElementById("csvFile");
            const file = fileInput.files[0];
            if(!file){
                alert("Selecione um arquivo CSV primeiro.");
                return;
            }
            const reader = new FileReader();
            reader.onload = function(evt){
                importCSVToTurma(turmaAtual.id, evt.target.result);
                renderTabelaNotas();
            };
            reader.readAsText(file);
            fileInput.value = "";
        });
    }

    // criar componente de nota
    const fComp = document.getElementById("formComponente");
    if(fComp){
        fComp.addEventListener("submit", e=>{
            e.preventDefault();
            const nome = fComp.nomeComp.value.trim();
            const sigla = fComp.sigla.value.trim();
            const descricao = fComp.descricao.value.trim();
            addComponente(disciplinaAtual.id, nome, sigla, descricao);
            fComp.reset();
            componentesDaDisciplina = listComponentesByDisciplina(disciplinaAtual.id);
            renderListaComponentes();
            renderTabelaNotas();
        });
    }

    // exportar CSV
    const btnExport = document.getElementById("btnExportCSV");
    if(btnExport){
        btnExport.addEventListener("click", ()=>{
            // regra 3.9: só pode exportar quando TODOS os alunos têm TODAS as notas
            // Vamos checar isso.
            const alunos = listAlunosByTurma(turmaAtual.id);
            const comps = listComponentesByDisciplina(disciplinaAtual.id);
            let pode = true;

            alunos.forEach(a=>{
                comps.forEach(c=>{
                    const v = getNotaValor(a.id,c.id);
                    if(v==="" || v===undefined){
                        pode = false;
                    }
                });
            });

            if(!pode){
                alert("Para exportar: todas as notas precisam estar lançadas para todos os alunos.");
                return;
            }

            exportTurmaCSV(turmaAtual.id);
        });
    }
}

function initTurma(){
    requireAuth();
    handleLogoutBtn();

    const turmaId = getQueryParam("turmaId");
    turmaAtual = getTurma(turmaId);
    if(!turmaAtual){
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