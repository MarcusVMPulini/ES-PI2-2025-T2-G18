function _getAppData() {
    const raw = localStorage.getItem("notadez_data");
    if (!raw) {
        return {
            users: [], // {id, nome, email, telefone, senha}
            sessions: {
                currentUserId: null
            },
            // instituições por usuário:
            // {id, userId, nomeInstituicao, nomeCurso}
            instituicoes: [],
            // disciplinas: {id, instituicaoId, nome, sigla, codigo, periodo}
            disciplinas: [],
            // turmas: {id, disciplinaId, nome, apelido}
            turmas: [],
            // alunos: {id, turmaId, matricula, nome}
            alunos: [],
            // componentes: {id, disciplinaId, nome, sigla, descricao}
            componentes: [],
            // notas: {idAluno, idComponente, valor}
            notas: []
        };
    }
    return JSON.parse(raw);
}

function _setAppData(data) {
    localStorage.setItem("notadez_data", JSON.stringify(data));
}

// ========== Usuário / sessão ==========
function createUser(nome, email, telefone, senha){
    const db = _getAppData();
    const exists = db.users.find(u=>u.email===email);
    if(exists){
        return {ok:false, msg:"E-mail já cadastrado"};
    }
    const newUser = {
        id: "user_" + Date.now(),
        nome,
        email,
        telefone,
        senha
    };
    db.users.push(newUser);
    db.sessions.currentUserId = newUser.id;
    _setAppData(db);
    return {ok:true, user:newUser};
}

function loginUser(email, senha){
    const db = _getAppData();
    const found = db.users.find(u=>u.email===email && u.senha===senha);
    if(!found){
        return {ok:false, msg:"Credenciais inválidas"};
    }
    db.sessions.currentUserId = found.id;
    _setAppData(db);
    return {ok:true, user:found};
}

function getCurrentUser(){
    const db = _getAppData();
    if(!db.sessions.currentUserId) return null;
    return db.users.find(u=>u.id===db.sessions.currentUserId) || null;
}

function logoutUser(){
    const db = _getAppData();
    db.sessions.currentUserId = null;
    _setAppData(db);
}

// ========== Instituições / Disciplinas / Turmas ==========
function addInstituicao(nomeInstituicao, nomeCurso){
    const db = _getAppData();
    const user = getCurrentUser();
    if(!user) return null;
    const inst = {
        id: "inst_" + Date.now(),
        userId: user.id,
        nomeInstituicao,
        nomeCurso
    };
    db.instituicoes.push(inst);
    _setAppData(db);
    return inst;
}

function listInstituicoesByUser(){
    const db = _getAppData();
    const user = getCurrentUser();
    if(!user) return [];
    return db.instituicoes.filter(i=>i.userId===user.id);
}

function addDisciplina(instituicaoId, nome, sigla, codigo, periodo){
    const db = _getAppData();
    const disc = {
        id: "disc_" + Date.now(),
        instituicaoId,
        nome,
        sigla,
        codigo,
        periodo
    };
    db.disciplinas.push(disc);
    _setAppData(db);
    return disc;
}

function listDisciplinasByInstituicao(instId){
    const db = _getAppData();
    return db.disciplinas.filter(d=>d.instituicaoId===instId);
}

function addTurma(disciplinaId, nome, apelido){
    const db = _getAppData();
    const t = {
        id: "turma_" + Date.now(),
        disciplinaId,
        nome,
        apelido
    };
    db.turmas.push(t);
    _setAppData(db);
    return t;
}

function listTurmasByDisciplina(disciplinaId){
    const db = _getAppData();
    return db.turmas.filter(t=>t.disciplinaId===disciplinaId);
}

function deleteTurma(turmaId){
    // OBS: no documento, exclusão de turma deveria pedir confirmação especial,
    // porém aqui vamos só remover direto no front.
    const db = _getAppData();
    db.alunos = db.alunos.filter(a=>a.turmaId!==turmaId);
    db.notas = db.notas.filter(n=>{
        const aluno = db.alunos.find(a=>a.id===n.idAluno);
        return aluno && aluno.turmaId!==turmaId;
    });
    db.turmas = db.turmas.filter(t=>t.id!==turmaId);
    _setAppData(db);
}

// ========== Alunos ==========
function addAluno(turmaId, matricula, nome){
    const db = _getAppData();
    const aluno = {
        id: "aluno_" + Date.now() + "_" + Math.floor(Math.random()*1000),
        turmaId,
        matricula,
        nome
    };
    db.alunos.push(aluno);
    _setAppData(db);
    return aluno;
}

function listAlunosByTurma(turmaId){
    const db = _getAppData();
    return db.alunos.filter(a=>a.turmaId===turmaId);
}

// Importar CSV: usa só as 2 primeiras colunas (matrícula e nome) :contentReference[oaicite:1]{index=1}
function importCSVToTurma(turmaId, csvText){
    const lines = csvText.split(/\r?\n/).filter(l=>l.trim()!=="");
    // pula header (linha 0)
    for(let i=1;i<lines.length;i++){
        const cols = lines[i].split(",");
        if(cols.length<2) continue;
        const matricula = cols[0].trim();
        const nome = cols[1].trim();
        if(!matricula || !nome) continue;
        // garantimos que não duplica matrícula dentro da turma
        const db = _getAppData();
        const exists = db.alunos.find(a=>a.turmaId===turmaId && a.matricula===matricula);
        if(!exists){
            addAluno(turmaId, matricula, nome);
        }
    }
}

// ========== Componentes de Nota ==========
function addComponente(disciplinaId, nome, sigla, descricao){
    const db = _getAppData();
    const comp = {
        id: "comp_" + Date.now(),
        disciplinaId,
        nome,
        sigla,
        descricao
    };
    db.componentes.push(comp);
    _setAppData(db);
    return comp;
}

function listComponentesByDisciplina(disciplinaId){
    const db = _getAppData();
    return db.componentes.filter(c=>c.disciplinaId===disciplinaId);
}

// ========== Notas ==========
function setNotaValor(idAluno, idComponente, valor){
    const db = _getAppData();
    let nota = db.notas.find(n=>n.idAluno===idAluno && n.idComponente===idComponente);
    if(!nota){
        nota = { idAluno, idComponente, valor };
        db.notas.push(nota);
    } else {
        nota.valor = valor;
    }
    _setAppData(db);
}

function getNotaValor(idAluno, idComponente){
    const db = _getAppData();
    const nota = db.notas.find(n=>n.idAluno===idAluno && n.idComponente===idComponente);
    return nota ? nota.valor : "";
}

// ========== Utilitários de vínculo ==========
function getTurma(turmaId){
    const db = _getAppData();
    return db.turmas.find(t=>t.id===turmaId);
}

function getDisciplinaById(discId){
    const db = _getAppData();
    return db.disciplinas.find(d=>d.id===discId);
}

function getInstituicaoById(instId){
    const db = _getAppData();
    return db.instituicoes.find(i=>i.id===instId);
}

// Exportar CSV das notas da turma (só CSV, conforme ajuste do requisito 3.9) :contentReference[oaicite:2]{index=2}
function exportTurmaCSV(turmaId){
    const turma = getTurma(turmaId);
    const disciplina = turma ? getDisciplinaById(turma.disciplinaId) : null;
    const comps = disciplina ? listComponentesByDisciplina(disciplina.id) : [];

    const alunos = listAlunosByTurma(turmaId);
    // monta cabeçalho
    let header = ["Matricula","Nome"];
    comps.forEach(c=>{
        header.push(c.sigla);
    });
    header.push("MediaFinal");
    let rows = [header.join(",")];

    alunos.forEach(al=>{
        let cols = [al.matricula, al.nome];
        let soma = 0;
        let count = 0;
        comps.forEach(c=>{
            const v = getNotaValor(al.id, c.id);
            let num = v!=="" ? parseFloat(v) : "";
            cols.push(num==="" ? "" : num.toFixed(2));
            if(num!=="" && !isNaN(num)){
                soma += num;
                count++;
            }
        });
        // média simples
        const media = (count>0 ? (soma / count) : 0).toFixed(2);
        cols.push(media);
        rows.push(cols.join(","));
    });

    const csvContent = rows.join("\n");
    // cria o download
    const blob = new Blob([csvContent], {type: "text/csv"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const agora = new Date();
    const nomeArquivo = agora.toISOString().slice(0,19).replace(/[:T]/g,"-")
        + "-" + (turma ? turma.nome : "Turma") + "-" + (disciplina?disciplina.sigla:"disc") + ".csv";
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
}
