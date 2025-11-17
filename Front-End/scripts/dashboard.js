//Autor: Marcus

// Dashboard - Gerenciamento de Instituições, Cursos, Disciplinas e Turmas

let instituicoes = [];
let cursos = [];
let disciplinas = [];
let turmas = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Dashboard carregando...');
  console.log('Token no localStorage:', API_CONFIG.getToken() ? 'existe' : 'não existe');
  
  if (!checkAuth()) {
    console.log('Autenticação falhou, saindo...');
    return;
  }
  
  console.log('Autenticação OK, continuando...');

  const user = API_CONFIG.getUser();
  if (user) {
    const usuarioSpan = document.querySelector('.usuario');
    if (usuarioSpan) {
      usuarioSpan.textContent = user.nome || 'Usuário';
    }
  }

  // Verificar se os selects existem no DOM
  console.log('=== Verificando elementos no DOM ===');
  console.log('disc_instituicao:', document.getElementById('disc_instituicao') ? '✅' : '❌');
  console.log('disc_instituicao_clone:', document.getElementById('disc_instituicao_clone') ? '✅' : '❌');
  console.log('turma_instituicao:', document.getElementById('turma_instituicao') ? '✅' : '❌');
  console.log('turma_disciplina:', document.getElementById('turma_disciplina') ? '✅' : '❌');

  await initDashboard();
  setupEventListeners();
  
  // Forçar atualização dos selects após 500ms (garantir que tudo foi carregado)
  setTimeout(() => {
    console.log('=== Atualização final dos selects ===');
    atualizarTodosSelects();
  }, 500);
});

// Função auxiliar para atualizar todos os selects
function atualizarTodosSelects() {
  console.log('Atualizando todos os selects...');
  console.log('Estado atual - Instituições:', instituicoes.length, 'Cursos:', cursos.length);
  
  if (instituicoes.length > 0 && cursos.length > 0) {
    populateSelects();
    populateDisciplinaSelect();
  } else {
    console.warn('Dados insuficientes para popular selects');
  }
}

async function initDashboard() {
  try {
    // Carregar dados na ordem correta
    await loadInstituicoes(); // Já carrega cursos também
    await loadDisciplinas();
    await loadTurmas();
    
    // Garantir que selects estão populados
    setTimeout(() => {
      populateSelects();
      populateDisciplinaSelect();
    }, 100);
  } catch (error) {
    console.error('Erro ao inicializar dashboard:', error);
    showAlert('Erro ao carregar dados.', 'danger');
  }
}

// === INSTITUIÇÕES E CURSOS ===
async function loadInstituicoes() {
  try {
    console.log('Carregando instituições...');
    const instituicoesResponse = await apiRequest('/instituicoes');
    console.log('Instituições carregadas:', instituicoesResponse);
    
    console.log('Carregando cursos...');
    const cursosResponse = await apiRequest('/cursos');
    console.log('Cursos carregados:', cursosResponse);
    
    // Garantir que são arrays
    instituicoes = Array.isArray(instituicoesResponse) ? instituicoesResponse : [];
    cursos = Array.isArray(cursosResponse) ? cursosResponse : [];
    
    console.log('=== Dados carregados ===');
    console.log('Instituições:', instituicoes);
    console.log('Cursos:', cursos);
    console.log('Total:', instituicoes.length, 'instituições e', cursos.length, 'cursos');
    
    renderInstituicoes();
    
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      populateSelects();
      populateDisciplinaSelect();
    }, 50);
  } catch (error) {
    console.error('Erro ao carregar instituições:', error);
    showAlert('Erro ao carregar instituições e cursos: ' + error.message, 'danger');
  }
}

function renderInstituicoes() {
  const container = document.getElementById('listaInstituicoes');
  if (!container) return;

  container.innerHTML = '';

  instituicoes.forEach(inst => {
    const cursosInst = cursos.filter(c => c.idInstituicao === inst.id);
    const div = document.createElement('div');
    div.className = 'card mb-2';
    div.innerHTML = `
      <div class="card-body">
        <h5>${inst.nome}</h5>
        ${cursosInst.map(curso => `
          <div class="d-flex justify-content-between align-items-center">
            <span>${curso.nomeCurso}</span>
            <button class="btn btn-sm btn-danger" onclick="deleteCurso(${curso.id})">Excluir</button>
          </div>
        `).join('')}
        <button class="btn btn-sm btn-danger mt-2" onclick="deleteInstituicao(${inst.id})">Excluir Instituição</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function populateSelects() {
  const selects = [
    'disc_instituicao',
    'disc_instituicao_clone',
    'turma_instituicao',
  ];

  console.log('=== Populando selects ===');
  console.log('Instituições:', instituicoes);
  console.log('Cursos:', cursos);
  console.log('Total instituições:', instituicoes.length, 'Total cursos:', cursos.length);

  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (!select) {
      console.warn(`⚠️ Select ${selectId} não encontrado no DOM`);
      return;
    }

    console.log(`Populando select: ${selectId}`);
    select.innerHTML = '<option value="">Selecione...</option>';
    
    if (!Array.isArray(instituicoes) || instituicoes.length === 0) {
      console.warn('Nenhuma instituição disponível');
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Nenhuma instituição cadastrada';
      option.disabled = true;
      select.appendChild(option);
      return;
    }

    if (!Array.isArray(cursos) || cursos.length === 0) {
      console.warn('Nenhum curso disponível');
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Nenhum curso cadastrado';
      option.disabled = true;
      select.appendChild(option);
      return;
    }

    let opcoesAdicionadas = 0;
    instituicoes.forEach((inst, index) => {
      if (!inst) {
        console.warn(`Instituição no índice ${index} é null/undefined`);
        return;
      }

      // Verificar se tem id (pode ser inst.id ou inst.instituicao?.id)
      const instId = inst.id || inst.instituicao?.id;
      const instNome = inst.nome || inst.instituicao?.nome || 'Sem nome';
      
      if (!instId) {
        console.warn('Instituição sem ID:', inst);
        return;
      }

      // Converter para número para garantir comparação correta
      const instIdNum = parseInt(instId);
      const cursosInst = cursos.filter(c => {
        if (!c) return false;
        const cursoInstId = c.idInstituicao || c.curso?.idInstituicao;
        return cursoInstId && parseInt(cursoInstId) === instIdNum;
      });
      
      console.log(`Instituição "${instNome}" (ID: ${instIdNum}) tem ${cursosInst.length} curso(s)`);
      
      if (cursosInst.length === 0) {
        // Se não tem curso, mostra só a instituição (desabilitada)
        const option = document.createElement('option');
        option.value = `${instIdNum}-0`;
        option.textContent = `${instNome} (sem curso)`;
        option.disabled = true;
        select.appendChild(option);
      } else {
        cursosInst.forEach(curso => {
          if (!curso) {
            console.warn('Curso é null/undefined');
            return;
          }
          
          const cursoId = curso.id || curso.curso?.id;
          const cursoNome = curso.nomeCurso || curso.curso?.nomeCurso || 'Sem nome';
          
          if (!cursoId) {
            console.warn('Curso sem ID:', curso);
            return;
          }
          
          const option = document.createElement('option');
          option.value = `${instIdNum}-${cursoId}`;
          option.textContent = `${instNome} - ${cursoNome}`;
          select.appendChild(option);
          opcoesAdicionadas++;
        });
      }
    });

    console.log(`✅ Select ${selectId} populado com ${opcoesAdicionadas} opção(ões) válida(s)`);
  });
  
  // Clonar disc_instituicao para disc_instituicao_clone
  const src1 = document.getElementById('disc_instituicao');
  const dst1 = document.getElementById('disc_instituicao_clone');
  if (src1 && dst1 && src1.options.length > 1) {
    dst1.innerHTML = src1.innerHTML;
    console.log('✅ Select disc_instituicao_clone clonado');
  }
}

// Formulário de Instituição + Curso
const formInstituicao = document.getElementById('formInstituicao');
if (formInstituicao) {
  formInstituicao.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nomeInstituicao = formData.get('nomeInstituicao');
    const nomeCurso = formData.get('nomeCurso');

    try {
      // Criar instituição
      const instResponse = await apiRequest('/instituicoes', {
        method: 'POST',
        body: JSON.stringify({ nome: nomeInstituicao }),
      });

      // A resposta pode ser { message: "...", instituicao: { id: ... } } ou apenas { instituicao: { id: ... } }
      const idInstituicao = instResponse.instituicao?.id || instResponse.id;
      
      if (!idInstituicao) {
        throw new Error('Erro ao obter ID da instituição criada');
      }

      // Criar curso
      await apiRequest('/cursos', {
        method: 'POST',
        body: JSON.stringify({
          nomeCurso: nomeCurso,
          idInstituicao: idInstituicao,
        }),
      });

      showAlert('Instituição e curso criados com sucesso!', 'success');
      e.target.reset();
      // Recarregar dados e atualizar selects
      await loadInstituicoes(); // Isso já recarrega cursos também
      // Forçar atualização dos selects após um pequeno delay
      setTimeout(() => {
        atualizarTodosSelects();
      }, 300);
    } catch (error) {
      showAlert(error.message || 'Erro ao criar instituição/curso.', 'danger');
    }
  });
}

async function deleteInstituicao(id) {
  if (!confirm('Tem certeza que deseja excluir esta instituição?')) return;

  try {
    await apiRequest(`/instituicoes/${id}`, { method: 'DELETE' });
    showAlert('Instituição excluída com sucesso!', 'success');
    await loadInstituicoes(); // Isso já recarrega cursos também
    setTimeout(() => {
      atualizarTodosSelects();
    }, 300);
  } catch (error) {
    showAlert(error.message || 'Erro ao excluir instituição.', 'danger');
  }
}

async function deleteCurso(id) {
  if (!confirm('Tem certeza que deseja excluir este curso?')) return;

  try {
    await apiRequest(`/cursos/${id}`, { method: 'DELETE' });
    showAlert('Curso excluído com sucesso!', 'success');
    await loadInstituicoes(); // Isso já recarrega cursos também
    setTimeout(() => {
      atualizarTodosSelects();
    }, 300);
  } catch (error) {
    showAlert(error.message || 'Erro ao excluir curso.', 'danger');
  }
}

// === DISCIPLINAS ===
async function loadDisciplinas() {
  try {
    disciplinas = await apiRequest('/disciplinas');
    console.log('Disciplinas carregadas:', disciplinas);
    renderDisciplinas();
    populateDisciplinaSelect();
  } catch (error) {
    console.error('Erro ao carregar disciplinas:', error);
  }
}

function renderDisciplinas() {
  const container = document.getElementById('listaDisciplinas');
  if (!container) return;

  const selectInst = document.getElementById('disc_instituicao');
  const selectedValue = selectInst?.value;
  if (!selectedValue) {
    container.innerHTML = '<p class="text-muted">Selecione uma instituição/curso acima.</p>';
    return;
  }

  const [idInst, idCurso] = selectedValue.split('-');
  const disciplinasFiltradas = disciplinas.filter(d => {
    const curso = cursos.find(c => c.id === parseInt(idCurso));
    return curso && d.idCurso === curso.id;
  });

  container.innerHTML = '';

  disciplinasFiltradas.forEach(disc => {
    const div = document.createElement('div');
    div.className = 'card mb-2';
    div.innerHTML = `
      <div class="card-body">
        <h6>${disc.nome} ${disc.sigla ? `(${disc.sigla})` : ''}</h6>
        <p class="text-muted small">${disc.codigo || ''} ${disc.periodo || ''}</p>
        <button class="btn btn-sm btn-primary" onclick="verTurmasDisciplina(${disc.id})">Ver Turmas</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDisciplina(${disc.id})">Excluir</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function populateDisciplinaSelect() {
  const select = document.getElementById('turma_disciplina');
  if (!select) {
    console.warn('Select turma_disciplina não encontrado');
    return;
  }

  const selectInst = document.getElementById('turma_instituicao');
  const selectedValue = selectInst?.value;
  
  if (!selectedValue) {
    select.innerHTML = '<option value="">Selecione instituição/curso primeiro</option>';
    // Clonar para o form
    const clone = document.getElementById('turma_disciplina_clone');
    if (clone) {
      clone.innerHTML = select.innerHTML;
    }
    return;
  }

  const [idInst, idCurso] = selectedValue.split('-');
  const idCursoNum = parseInt(idCurso);
  
  if (isNaN(idCursoNum) || idCursoNum === 0) {
    select.innerHTML = '<option value="">Selecione um curso válido</option>';
    return;
  }

  const disciplinasFiltradas = disciplinas.filter(d => {
    return d.idCurso === idCursoNum;
  });

  console.log(`Populando disciplinas. Filtradas: ${disciplinasFiltradas.length} de ${disciplinas.length} total`);

  select.innerHTML = '<option value="">Selecione...</option>';
  
  if (disciplinasFiltradas.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Nenhuma disciplina cadastrada para este curso';
    option.disabled = true;
    select.appendChild(option);
  } else {
    disciplinasFiltradas.forEach(disc => {
      const option = document.createElement('option');
      option.value = disc.id;
      option.textContent = `${disc.nome} ${disc.sigla ? `(${disc.sigla})` : ''}`;
      select.appendChild(option);
    });
  }

  // Clonar para o form
  const clone = document.getElementById('turma_disciplina_clone');
  if (clone) {
    clone.innerHTML = select.innerHTML;
    console.log('✅ Select turma_disciplina_clone clonado');
  }
}

const formDisciplina = document.getElementById('formDisciplina');
if (formDisciplina) {
  formDisciplina.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const instituicaoValue = formData.get('instituicao');
    const [idInst, idCurso] = instituicaoValue.split('-');
    const curso = cursos.find(c => c.id === parseInt(idCurso));

    if (!curso) {
      showAlert('Selecione um curso válido.', 'warning');
      return;
    }

    try {
      await apiRequest('/disciplinas', {
        method: 'POST',
        body: JSON.stringify({
          nome: formData.get('nome'),
          idCurso: curso.id,
          sigla: formData.get('sigla'),
          codigo: formData.get('codigo'),
          periodo: formData.get('periodo'),
        }),
      });

      showAlert('Disciplina criada com sucesso!', 'success');
      e.target.reset();
      await loadDisciplinas();
      populateDisciplinaSelect(); // Atualizar select de disciplinas
    } catch (error) {
      showAlert(error.message || 'Erro ao criar disciplina.', 'danger');
    }
  });
}

async function deleteDisciplina(id) {
  if (!confirm('Tem certeza que deseja excluir esta disciplina?')) return;

  try {
    await apiRequest(`/disciplinas/${id}`, { method: 'DELETE' });
    showAlert('Disciplina excluída com sucesso!', 'success');
    await loadDisciplinas();
  } catch (error) {
    showAlert(error.message || 'Erro ao excluir disciplina.', 'danger');
  }
}

// === TURMAS ===
async function loadTurmas() {
  try {
    turmas = await apiRequest('/turmas');
    renderTurmas();
  } catch (error) {
    console.error('Erro ao carregar turmas:', error);
  }
}

function renderTurmas() {
  const container = document.getElementById('listaTurmas');
  if (!container) return;

  const selectDisc = document.getElementById('turma_disciplina');
  const idDisciplina = parseInt(selectDisc?.value);
  if (!idDisciplina) {
    container.innerHTML = '<p class="text-muted">Selecione uma disciplina acima.</p>';
    return;
  }

  const turmasFiltradas = turmas.filter(t => t.idDisciplina === idDisciplina);
  container.innerHTML = '';

  turmasFiltradas.forEach(turma => {
    const disciplina = disciplinas.find(d => d.id === turma.idDisciplina);
    const div = document.createElement('div');
    div.className = 'card mb-2';
    div.innerHTML = `
      <div class="card-body">
        <h6>${turma.nome} ${turma.apelido ? `(${turma.apelido})` : ''}</h6>
        <p class="text-muted small">${disciplina?.nome || ''} - ${turma.ano}/${turma.semestre}</p>
        <button class="btn btn-sm btn-primary" onclick="window.location.href='Turmas.html?idTurma=${turma.id}'">Abrir Turma</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTurma(${turma.id})">Excluir</button>
      </div>
    `;
    container.appendChild(div);
  });
}

const formTurma = document.getElementById('formTurma');
if (formTurma) {
  formTurma.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const idDisciplina = parseInt(formData.get('disciplina'));

    if (!idDisciplina) {
      showAlert('Selecione uma disciplina.', 'warning');
      return;
    }

    try {
      await apiRequest('/turmas', {
        method: 'POST',
        body: JSON.stringify({
          nome: formData.get('nomeTurma'),
          idDisciplina: idDisciplina,
          ano: new Date().getFullYear(),
          semestre: 1,
          apelido: formData.get('apelido'),
        }),
      });

      showAlert('Turma criada com sucesso!', 'success');
      e.target.reset();
      await loadTurmas();
    } catch (error) {
      showAlert(error.message || 'Erro ao criar turma.', 'danger');
    }
  });
}

async function deleteTurma(id) {
  if (!confirm('Tem certeza que deseja excluir esta turma? Esta operação é irrevogável!')) return;

  try {
    await apiRequest(`/turmas/${id}`, { method: 'DELETE' });
    showAlert('Turma excluída com sucesso!', 'success');
    await loadTurmas();
  } catch (error) {
    showAlert(error.message || 'Erro ao excluir turma.', 'danger');
  }
}

// Função para ver turmas de uma disciplina
async function verTurmasDisciplina(idDisciplina) {
  try {
    const turmasDisciplina = turmas.filter(t => t.idDisciplina === idDisciplina);
    if (turmasDisciplina.length === 0) {
      showAlert('Nenhuma turma encontrada para esta disciplina.', 'info');
      return;
    }
    // Ir para a primeira turma
    window.location.href = `Turmas.html?idTurma=${turmasDisciplina[0].id}`;
  } catch (error) {
    showAlert('Erro ao carregar turmas.', 'danger');
  }
}

// Event listeners para selects
function setupEventListeners() {
  const discInstSelect = document.getElementById('disc_instituicao');
  if (discInstSelect) {
    discInstSelect.addEventListener('change', () => {
      console.log('Select disc_instituicao mudou:', discInstSelect.value);
      renderDisciplinas();
    });
  }

  const turmaInstSelect = document.getElementById('turma_instituicao');
  if (turmaInstSelect) {
    turmaInstSelect.addEventListener('change', () => {
      console.log('Select turma_instituicao mudou:', turmaInstSelect.value);
      populateDisciplinaSelect();
      renderTurmas();
    });
  }

  const turmaDiscSelect = document.getElementById('turma_disciplina');
  if (turmaDiscSelect) {
    turmaDiscSelect.addEventListener('change', () => {
      console.log('Select turma_disciplina mudou:', turmaDiscSelect.value);
      renderTurmas();
      // Clonar para o form
      const clone = document.getElementById('turma_disciplina_clone');
      if (clone && turmaDiscSelect.options.length > 0) {
        clone.innerHTML = turmaDiscSelect.innerHTML;
      }
    });
  }

  // Atualizar selects quando criar/excluir itens
  // Isso já está sendo feito nas funções de create/delete
}

