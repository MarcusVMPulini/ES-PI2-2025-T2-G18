function renderUserInfo(user){
    const el = document.getElementById("userInfo");
    if(el){
        el.textContent = "Olá, " + user.nome + " (" + user.email + ")";
    }
}

function populateInstituicoes(){
    const list = document.getElementById("listaInstituicoes");
    const selInstDisc = document.getElementById("disc_instituicao");
    const selInstTurma = document.getElementById("turma_instituicao");
    const selDiscTurma = document.getElementById("turma_disciplina");
    const containerDisciplinas = document.getElementById("listaDisciplinas");
    const containerTurmas = document.getElementById("listaTurmas");

    if(list) list.innerHTML = "";
    if(selInstDisc) selInstDisc.innerHTML = "";
    if(selInstTurma) selInstTurma.innerHTML = "";
    if(selDiscTurma) selDiscTurma.innerHTML = "";
    if(containerDisciplinas) containerDisciplinas.innerHTML = "";
    if(containerTurmas) containerTurmas.innerHTML = "";

    const instituicoes = listInstituicoesByUser();
    instituicoes.forEach(inst=>{
        // lista lateral
        if(list){
            const div = document.createElement("div");
            div.className="card-item";
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
        if(selInstDisc){
            const o = document.createElement("option");
            o.value = inst.id;
            o.textContent = inst.nomeInstituicao + " / " + inst.nomeCurso;
            selInstDisc.appendChild(o);
        }
        if(selInstTurma){
            const o2 = document.createElement("option");
            o2.value = inst.id;
            o2.textContent = inst.nomeInstituicao + " / " + inst.nomeCurso;
            selInstTurma.appendChild(o2);
        }
    });

    // quando muda instituição em "disciplinas", render disciplinas
    if(selInstDisc){
        selInstDisc.addEventListener("change", ()=>{
            renderDisciplinas(selInstDisc.value);
        });
        if(selInstDisc.value){
            renderDisciplinas(selInstDisc.value);
        }
    }

    // quando muda instituição em "turmas", atualiza disciplinas do select turma_disciplina
    if(selInstTurma){
        selInstTurma.addEventListener("change", ()=>{
            fillDisciplinaFromInstituicao(selInstTurma.value);
        });
        if(selInstTurma.value){
            fillDisciplinaFromInstituicao(selInstTurma.value);
        }
    }

    // função interna
    function fillDisciplinaFromInstituicao(instId){
        if(!selDiscTurma) return;
        selDiscTurma.innerHTML = "";
        const discs = listDisciplinasByInstituicao(instId);
        discs.forEach(d=>{
            const o = document.createElement("option");
            o.value = d.id;
            o.textContent = d.nome + " ("+d.sigla+")";
            selDiscTurma.appendChild(o);
        });
        renderTurmas(selDiscTurma.value);
        selDiscTurma.addEventListener("change", ()=>{
            renderTurmas(selDiscTurma.value);
        });
    }

    function renderDisciplinas(instId){
        if(!containerDisciplinas) return;
        containerDisciplinas.innerHTML = "";
        const discs = listDisciplinasByInstituicao(instId);
        discs.forEach(d=>{
            const box = document.createElement("div");
            box.className="card-item";
            box.innerHTML = `
                <strong>${d.nome} (${d.sigla})</strong>
                <small>Código: ${d.codigo} | Período: ${d.periodo}</small>
                <div style="margin-top:4px;font-size:12px;color:#555;">
                    ID: ${d.id}
                </div>
            `;
            containerDisciplinas.appendChild(box);
        });
    }

    function renderTurmas(discId){
        if(!containerTurmas) return;
        containerTurmas.innerHTML = "";
        const turmas = listTurmasByDisciplina(discId);
        turmas.forEach(t=>{
            const box = document.createElement("div");
            box.className="card-item";
            box.innerHTML = `
                <strong>${t.nome}</strong>
                <small>Apelido: ${t.apelido}</small>
                <div style="margin-top:4px;font-size:12px;color:#555;">
                    ID: ${t.id}
                </div>
                <div style="margin-top:8px;">
                    <a class="inline" href="turma.html?turmaId=${t.id}" style="font-size:12px;">Abrir turma</a>
                    <button class="small danger" data-del="${t.id}">Excluir turma</button>
                </div>
            `;
            containerTurmas.appendChild(box);
        });

        // botão excluir turma conforme doc precisa confirmação.
        // Aqui só confirm() simples no front.
        containerTurmas.querySelectorAll("button[data-del]").forEach(btn=>{
            btn.addEventListener("click", ()=>{
                const tid = btn.getAttribute("data-del");
                const ok = confirm("Tem certeza que deseja excluir esta turma? Esta ação é irreversível.");
                if(ok){
                    deleteTurma(tid);
                    renderTurmas(discId);
                }
            });
        });
    }
}

function setupForms(){
    // form instituição
    const f1 = document.getElementById("formInstituicao");
    if(f1){
        f1.addEventListener("submit", e=>{
            e.preventDefault();
            addInstituicao(f1.nomeInstituicao.value.trim(), f1.nomeCurso.value.trim());
            f1.reset();
            populateInstituicoes();
        });
    }

    // form disciplina
    const f2 = document.getElementById("formDisciplina");
    if(f2){
        f2.addEventListener("submit", e=>{
            e.preventDefault();
            const instId = f2.instituicao.value;
            addDisciplina(
                instId,
                f2.nome.value.trim(),
                f2.sigla.value.trim(),
                f2.codigo.value.trim(),
                f2.periodo.value.trim()
            );
            f2.reset();
            populateInstituicoes();
        });
    }

    // form turma
    const f3 = document.getElementById("formTurma");
    if(f3){
        f3.addEventListener("submit", e=>{
            e.preventDefault();
            const discId = f3.disciplina.value;
            addTurma(
                discId,
                f3.nomeTurma.value.trim(),
                f3.apelido.value.trim()
            );
            f3.reset();
            populateInstituicoes();
        });
    }
}

function initDashboard(){
    const user = requireAuth();
    renderUserInfo(user);
    setupForms();
    populateInstituicoes();
    handleLogoutBtn();
}

document.addEventListener("DOMContentLoaded", initDashboard);