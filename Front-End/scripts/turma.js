// Turma - Gerenciamento de Componentes, Alunos e Notas

let turmaAtual = null;
let disciplinaAtual = null;
let componentes = [];
let alunos = [];
let notas = [];
let notasFinais = []; // Notas finais da tabela notas
let editandoComponente = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;

  const urlParams = new URLSearchParams(window.location.search);
  let idTurma = urlParams.get('idTurma');
  const idDisciplina = urlParams.get('idDisciplina');

  // Se passou idDisciplina, buscar primeira turma ou criar uma
  if (!idTurma && idDisciplina) {
    try {
      const turmas = await apiRequest('/turmas');
      const turmasDisciplina = turmas.filter(t => t.idDisciplina === parseInt(idDisciplina));
      if (turmasDisciplina.length > 0) {
        idTurma = turmasDisciplina[0].id;
      } else {
        showAlert('Nenhuma turma encontrada para esta disciplina. Crie uma turma primeiro.', 'warning');
        setTimeout(() => window.location.href = 'dashbord.html', 2000);
        return;
      }
    } catch (error) {
      showAlert('Erro ao buscar turmas.', 'danger');
      return;
    }
  }

  if (!idTurma) {
    showAlert('Turma não especificada. Redirecionando...', 'warning');
    setTimeout(() => window.location.href = 'dashbord.html', 2000);
    return;
  }

  await loadTurmaData(idTurma);
  setupEventListeners();
});

async function loadTurmaData(idTurma) {
  try {
    turmaAtual = await apiRequest(`/turmas/${idTurma}`);
    if (!turmaAtual || !turmaAtual.idDisciplina) {
      throw new Error('Turma inválida');
    }
    disciplinaAtual = await apiRequest(`/disciplinas/${turmaAtual.idDisciplina}`);
    
    renderTurmaInfo();
    await loadComponentes();
    await loadAlunos();
    await loadNotas();
    await loadNotasFinais();
  } catch (error) {
    console.error('Erro ao carregar dados da turma:', error);
    showAlert('Erro ao carregar dados da turma. ' + error.message, 'danger');
  }
}

function renderTurmaInfo() {
  const container = document.getElementById('turmaInfo');
  if (!container || !turmaAtual || !disciplinaAtual) return;

  container.innerHTML = `
    <strong>Turma:</strong> ${turmaAtual.nome} ${turmaAtual.apelido ? `(${turmaAtual.apelido})` : ''}<br>
    <strong>Disciplina:</strong> ${disciplinaAtual.nome} ${disciplinaAtual.sigla ? `(${disciplinaAtual.sigla})` : ''}<br>
    <strong>Ano/Semestre:</strong> ${turmaAtual.ano}/${turmaAtual.semestre}
  `;
}

// === COMPONENTES DE NOTA ===
async function loadComponentes() {
  try {
    componentes = await apiRequest(`/componentes-nota/disciplina/${disciplinaAtual.id}`);
    renderComponentes();
  } catch (error) {
    console.error('Erro ao carregar componentes:', error);
  }
}

function renderComponentes() {
  const container = document.getElementById('listaComponentes');
  if (!container) return;

  if (componentes.length === 0) {
    container.innerHTML = '<p class="text-muted">Nenhum componente cadastrado.</p>';
    return;
  }

  container.innerHTML = '';
  componentes.forEach(comp => {
    const div = document.createElement('div');
    div.className = 'card mb-2';
    div.innerHTML = `
      <div class="card-body">
        <h6>${comp.nome} (${comp.sigla})</h6>
        <p class="text-muted small">${comp.descricao || ''}</p>
        <p class="small mb-2">
          <strong>Peso:</strong> ${comp.peso !== null && comp.peso !== undefined ? comp.peso + '%' : 'Não definido'}
        </p>
        <button class="btn btn-sm btn-primary me-2" onclick="editarComponente(${comp.id})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteComponente(${comp.id})">Excluir</button>
      </div>
    `;
    container.appendChild(div);
  });
}

const formComponente = document.getElementById('formComponente');
if (formComponente) {
  formComponente.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const pesoStr = formData.get('peso');
      const peso = pesoStr && pesoStr.trim() !== '' ? parseFloat(pesoStr) : undefined;

      await apiRequest(`/componentes-nota/disciplina/${disciplinaAtual.id}`, {
        method: 'POST',
        body: JSON.stringify({
          nome: formData.get('nomeComp'),
          sigla: formData.get('sigla').toUpperCase(),
          descricao: formData.get('descricao'),
          peso: peso,
        }),
      });

      showAlert('Componente criado com sucesso!', 'success');
      e.target.reset();
      await loadComponentes();
      await loadNotas(); // Recarregar tabela de notas
      await loadNotasFinais(); // Recarregar notas finais
    } catch (error) {
      showAlert(error.message || 'Erro ao criar componente.', 'danger');
    }
  });
}

async function editarComponente(id) {
  const componente = componentes.find(c => c.id === id);
  if (!componente) {
    showAlert('Componente não encontrado.', 'danger');
    return;
  }

  // Criar modal de edição
  const modalHtml = `
    <div class="modal fade" id="modalEditarComponente" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Editar Componente</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="formEditarComponente">
              <div class="mb-3">
                <label class="form-label">Nome</label>
                <input type="text" class="form-control" name="nome" value="${componente.nome}" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Sigla</label>
                <input type="text" class="form-control" name="sigla" value="${componente.sigla}" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Descrição</label>
                <textarea class="form-control" name="descricao" rows="3">${componente.descricao || ''}</textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Peso na Nota Final (%)</label>
                <input type="number" class="form-control" name="peso" min="0" max="100" step="0.01" 
                       value="${componente.peso !== null && componente.peso !== undefined ? componente.peso : ''}" 
                       placeholder="Ex: 40" />
                <small class="form-text text-muted">Percentual que este componente vale na nota final (0-100)</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="salvarEdicaoComponente(${id})">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remover modal anterior se existir
  const modalAntigo = document.getElementById('modalEditarComponente');
  if (modalAntigo) {
    modalAntigo.remove();
  }

  // Adicionar modal ao body
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('modalEditarComponente'));
  modal.show();

  // Remover modal do DOM quando fechar
  document.getElementById('modalEditarComponente').addEventListener('hidden.bs.modal', function () {
    this.remove();
  });
}

async function salvarEdicaoComponente(id) {
  const form = document.getElementById('formEditarComponente');
  if (!form) return;

  const formData = new FormData(form);
  const pesoStr = formData.get('peso');
  const peso = pesoStr && pesoStr.trim() !== '' ? parseFloat(pesoStr) : undefined;

  try {
    await apiRequest(`/componentes-nota/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nome: formData.get('nome'),
        sigla: formData.get('sigla').toUpperCase(),
        descricao: formData.get('descricao'),
        peso: peso,
      }),
    });

    showAlert('Componente atualizado com sucesso!', 'success');
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarComponente'));
    if (modal) modal.hide();

    await loadComponentes();
    await loadNotas();
    await loadNotasFinais();
    
    // Recalcular notas finais após editar componente
    alunos.forEach(aluno => {
      calcularNotaFinalAluno(aluno.id);
    });
  } catch (error) {
    showAlert(error.message || 'Erro ao atualizar componente.', 'danger');
  }
}

async function deleteComponente(id) {
  if (!confirm('Tem certeza que deseja excluir este componente?')) return;

  try {
    await apiRequest(`/componentes-nota/${id}`, { method: 'DELETE' });
    showAlert('Componente excluído com sucesso!', 'success');
    await loadComponentes();
    await loadNotas();
    // Recalcular notas finais após excluir componente
    alunos.forEach(aluno => {
      calcularNotaFinalAluno(aluno.id);
    });
  } catch (error) {
    showAlert(error.message || 'Erro ao excluir componente.', 'danger');
  }
}

// === ALUNOS ===
async function loadAlunos() {
  try {
    const matriculas = await apiRequest(`/matriculas`);
    const matriculasTurma = matriculas.filter(m => m.idTurma === turmaAtual.id);
    const alunosIds = matriculasTurma.map(m => m.idAluno);
    
    if (alunosIds.length === 0) {
      alunos = [];
      return;
    }

    const todosAlunos = await apiRequest('/alunos');
    alunos = todosAlunos.filter(a => alunosIds.includes(a.id));
  } catch (error) {
    console.error('Erro ao carregar alunos:', error);
  }
}

const formAluno = document.getElementById('formAluno');
if (formAluno) {
  formAluno.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const ra = formData.get('matricula');
    const nome = formData.get('nome');

    try {
      // Verificar se aluno já existe
      const todosAlunos = await apiRequest('/alunos');
      let aluno = todosAlunos.find(a => a.ra === ra);

      if (!aluno) {
        // Criar aluno
        const novoAluno = await apiRequest('/alunos', {
          method: 'POST',
          body: JSON.stringify({ nome, ra }),
        });
        aluno = novoAluno.aluno;
      }

      // Matricular na turma
      await apiRequest('/matriculas', {
        method: 'POST',
        body: JSON.stringify({
          idAluno: aluno.id,
          idTurma: turmaAtual.id,
        }),
      });

      showAlert('Aluno adicionado com sucesso!', 'success');
      e.target.reset();
      await loadAlunos();
      await loadNotas();
      await loadNotasFinais();
    } catch (error) {
      showAlert(error.message || 'Erro ao adicionar aluno.', 'danger');
    }
  });
}

// Importação CSV
const formImportCSV = document.getElementById('formImportCSV');
if (formImportCSV) {
  formImportCSV.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
      showAlert('Selecione um arquivo CSV.', 'warning');
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const alunosData = [];

      // Pular header se existir
      const startIndex = lines[0].toLowerCase().includes('matricula') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
        if (columns.length >= 2 && columns[0] && columns[1]) {
          alunosData.push({
            ra: columns[0],
            nome: columns[1],
          });
        }
      }

      if (alunosData.length === 0) {
        showAlert('Nenhum aluno válido encontrado no CSV.', 'warning');
        return;
      }

      const result = await apiRequest(`/turmas/${turmaAtual.id}/importar-alunos`, {
        method: 'POST',
        body: JSON.stringify({ alunos: alunosData }),
      });

      showAlert(`Importação concluída! ${result.importados} importados, ${result.ignorados} ignorados.`, 'success');
      fileInput.value = '';
      await loadAlunos();
      await loadNotas();
      await loadNotasFinais();
    } catch (error) {
      showAlert(error.message || 'Erro ao importar CSV.', 'danger');
    }
  });
}

// === NOTAS ===
async function loadNotas() {
  try {
    const notasData = await apiRequest(`/notas-componente/turma/${turmaAtual.id}`);
    notas = notasData;
    renderTabelaNotas();
  } catch (error) {
    console.error('Erro ao carregar notas:', error);
    notas = [];
    renderTabelaNotas();
  }
}

// Carregar notas finais da tabela notas
async function loadNotasFinais() {
  try {
    const notasFinaisData = await apiRequest(`/notas-componente/turma/${turmaAtual.id}/notas-finais`);
    console.log('Notas finais carregadas:', notasFinaisData);
    notasFinais = notasFinaisData || [];
    // Atualizar exibição das notas finais na tabela
    atualizarNotasFinaisNaTabela();
  } catch (error) {
    console.error('Erro ao carregar notas finais:', error);
    notasFinais = [];
  }
}

// Atualizar notas finais na tabela sem recriar tudo
function atualizarNotasFinaisNaTabela() {
  console.log('Atualizando notas finais na tabela. Alunos:', alunos.length, 'Notas finais:', notasFinais.length);
  
  alunos.forEach(aluno => {
    const notaFinal = notasFinais.find(n => {
      // Garantir que ambos sejam números para comparação
      const nIdAluno = typeof n.idAluno === 'number' ? n.idAluno : parseInt(n.idAluno);
      const alunoId = typeof aluno.id === 'number' ? aluno.id : parseInt(aluno.id);
      return nIdAluno === alunoId;
    });
    
    const notaFinalEl = document.getElementById(`nota-final-${aluno.id}`);
    const situacaoEl = document.getElementById(`situacao-${aluno.id}`);

    console.log(`Aluno ${aluno.id} (${aluno.nome}):`, {
      notaFinal,
      notaFinalEl: !!notaFinalEl,
      situacaoEl: !!situacaoEl
    });

    if (notaFinalEl) {
      if (notaFinal && notaFinal.media !== undefined && notaFinal.media !== null) {
        const media = parseFloat(notaFinal.media);
        if (!isNaN(media)) {
          notaFinalEl.textContent = media.toFixed(2);
          notaFinalEl.className = `text-center fw-bold ${media >= 6 ? 'text-success' : 'text-danger'}`;
          console.log(`  → Nota final atualizada: ${media.toFixed(2)}`);
        } else {
          console.warn(`  → Media inválida para aluno ${aluno.id}:`, notaFinal.media);
          // Se media inválida, calcular localmente
          calcularNotaFinalLocal(aluno.id);
        }
      } else {
        console.log(`  → Sem nota final salva para aluno ${aluno.id}, calculando localmente...`);
        // Se não tiver nota final salva, calcular localmente baseado nos inputs
        calcularNotaFinalLocal(aluno.id);
      }
    } else {
      console.warn(`  → Elemento nota-final-${aluno.id} não encontrado!`);
    }

    if (situacaoEl) {
      if (notaFinal && notaFinal.situacao) {
        situacaoEl.textContent = notaFinal.situacao;
        situacaoEl.className = `text-center ${notaFinal.situacao === 'Aprovado' ? 'text-success' : 'text-danger'}`;
        console.log(`  → Situação atualizada: ${notaFinal.situacao}`);
      } else {
        console.log(`  → Sem situação salva para aluno ${aluno.id}, será calculada localmente`);
        // Situação será calculada pela função calcularNotaFinalLocal
      }
    } else {
      console.warn(`  → Elemento situacao-${aluno.id} não encontrado!`);
    }
  });
}

function renderTabelaNotas() {
  const container = document.getElementById('areaNotas');
  if (!container) return;

  if (componentes.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Cadastre componentes de nota primeiro.</div>';
    return;
  }

  if (alunos.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Adicione alunos à turma primeiro.</div>';
    return;
  }

  // Criar tabela
  let html = `
    <div class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>Matrícula</th>
            <th>Nome</th>
            ${componentes.map(c => `<th>${c.sigla}</th>`).join('')}
            <th>Nota Final</th>
            <th>Situação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
  `;

  alunos.forEach(aluno => {
    html += `<tr id="row-aluno-${aluno.id}">`;
    html += `<td>
      <input 
        type="text" 
        class="form-control form-control-sm" 
        value="${aluno.ra}"
        data-aluno-id="${aluno.id}"
        data-field="ra"
        onblur="salvarEdicaoAluno(this)"
        style="min-width: 100px;"
      />
    </td>`;
    html += `<td>
      <input 
        type="text" 
        class="form-control form-control-sm" 
        value="${aluno.nome}"
        data-aluno-id="${aluno.id}"
        data-field="nome"
        onblur="salvarEdicaoAluno(this)"
        style="min-width: 200px;"
      />
    </td>`;

    componentes.forEach(comp => {
      const nota = notas.find(n => n.idAluno === aluno.id && n.idComponente === comp.id);
      const valor = nota ? nota.valor.toFixed(2) : '-';
      const notaId = nota ? nota.id : null;

      html += `<td>
        <input 
          type="number" 
          class="form-control form-control-sm nota-input" 
          id="nota-${aluno.id}-${comp.id}"
          data-aluno="${aluno.id}" 
          data-componente="${comp.id}"
          data-nota-id="${notaId || ''}"
          data-valor-original="${valor === '-' ? '' : valor}"
          value="${valor === '-' ? '' : valor}"
          min="0" 
          max="10" 
          step="0.01"
          placeholder="-"
        />
      </td>`;
    });

    // Calcular nota final (será atualizado via API)
    html += `<td id="nota-final-${aluno.id}" class="text-center">-</td>`;
    html += `<td id="situacao-${aluno.id}" class="text-center">-</td>`;
    html += `<td>
      <button 
        class="btn btn-sm btn-primary salvar-notas-btn" 
        data-aluno="${aluno.id}"
        onclick="salvarNotasAluno(${aluno.id})"
        title="Salvar todas as notas deste aluno"
      >
        💾 Salvar
      </button>
    </td>`;
    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Carregar notas finais da tabela notas após renderizar
  setTimeout(async () => {
    // Primeiro atualizar com as notas finais já salvas
    atualizarNotasFinaisNaTabela();
    
    // Para cada aluno, verificar se precisa calcular nota final
    for (const aluno of alunos) {
      const temNotaFinal = notasFinais.find(n => n.idAluno === aluno.id);
      
      // Verificar se há notas nos inputs
      const inputsNota = document.querySelectorAll(`input.nota-input[data-aluno="${aluno.id}"]`);
      let temNotasNosInputs = false;
      for (const input of inputsNota) {
        if (input.value.trim() !== '') {
          temNotasNosInputs = true;
          break;
        }
      }
      
      if (!temNotaFinal && temNotasNosInputs) {
        // Se não tem nota final salva mas tem notas nos inputs, calcular
        try {
          await calcularNotaFinalAluno(aluno.id);
        } catch (error) {
          // Se falhar, calcular localmente
          calcularNotaFinalLocal(aluno.id);
        }
      } else if (!temNotaFinal) {
        // Se não tem nota final e não tem notas, calcular localmente (vai mostrar 0.00)
        calcularNotaFinalLocal(aluno.id);
      } else if (temNotasNosInputs) {
        // Se tem nota final salva mas também tem notas nos inputs, recalcular para garantir consistência
        calcularNotaFinalLocal(aluno.id);
      }
    }
  }, 300);
}

// Salvar todas as notas de um aluno
async function salvarNotasAluno(idAluno) {
  const btn = document.querySelector(`button.salvar-notas-btn[data-aluno="${idAluno}"]`);
  if (!btn) return;

  // Desabilitar botão durante salvamento
  btn.disabled = true;
  btn.innerHTML = '⏳ Salvando...';

  const inputsNota = document.querySelectorAll(`input.nota-input[data-aluno="${idAluno}"]`);
  const notasParaSalvar = [];
  let temErro = false;

  // Validar e coletar todas as notas
  for (const input of inputsNota) {
    const idComponente = parseInt(input.dataset.componente);
    const valorStr = input.value.trim();

    // Se o campo estiver vazio, pular (permitir deixar em branco)
    if (valorStr === '' || valorStr === null) {
      continue;
    }

    const valor = parseFloat(valorStr);

    if (isNaN(valor) || valor < 0 || valor > 10) {
      showAlert(`Valor inválido para componente ${input.dataset.componente}. Deve estar entre 0.00 e 10.00`, 'warning');
      input.classList.add('border-danger');
      temErro = true;
      continue;
    }

    notasParaSalvar.push({
      idComponente,
      valor,
      input
    });
  }

  if (temErro) {
    btn.disabled = false;
    btn.innerHTML = '💾 Salvar';
    return;
  }

  // Salvar todas as notas
  try {
    for (const notaData of notasParaSalvar) {
      const response = await apiRequest(`/notas-componente/turma/${turmaAtual.id}/componente/${notaData.idComponente}`, {
        method: 'POST',
        body: JSON.stringify({
          idAluno,
          valor: notaData.valor,
        }),
      });

      // Atualizar o data-nota-id com o ID retornado
      if (response.nota && response.nota.id) {
        notaData.input.dataset.notaId = response.nota.id.toString();
        notaData.input.dataset.valorOriginal = notaData.valor.toFixed(2);
      }

      // Atualizar a nota na lista local
      const notaIndex = notas.findIndex(n => n.idAluno === idAluno && n.idComponente === notaData.idComponente);
      if (notaIndex >= 0) {
        notas[notaIndex].valor = notaData.valor;
        if (response.nota && response.nota.id) {
          notas[notaIndex].id = response.nota.id;
        }
      } else if (response.nota) {
        notas.push(response.nota);
      }

      // Feedback visual de sucesso no input
      notaData.input.classList.remove('border-danger');
      notaData.input.classList.add('border-success');
      setTimeout(() => {
        notaData.input.classList.remove('border-success');
      }, 2000);
    }

    // Calcular e salvar nota final via API (que salva na tabela notas)
    try {
      await calcularNotaFinalAluno(idAluno);
    } catch (error) {
      console.warn('Erro ao calcular nota final, usando cálculo local:', error);
      calcularNotaFinalLocal(idAluno);
    }

    showAlert('Notas salvas com sucesso!', 'success');
    
    // Restaurar botão
    btn.disabled = false;
    btn.innerHTML = '✅ Salvo';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-success');
    
    setTimeout(() => {
      btn.innerHTML = '💾 Salvar';
      btn.classList.remove('btn-success');
      btn.classList.add('btn-primary');
    }, 2000);

  } catch (error) {
    console.error('Erro ao salvar notas:', error);
    showAlert(error.message || 'Erro ao salvar notas.', 'danger');
    
    // Restaurar botão
    btn.disabled = false;
    btn.innerHTML = '💾 Salvar';
  }
}

async function calcularNotaFinalAluno(idAluno) {
  try {
    console.log(`Calculando nota final para aluno ${idAluno}...`);
    const result = await apiRequest(`/notas-componente/turma/${turmaAtual.id}/aluno/${idAluno}/nota-final`);
    console.log(`Resultado do cálculo para aluno ${idAluno}:`, result);
    
    // Atualizar exibição imediatamente com o resultado
    const notaFinalEl = document.getElementById(`nota-final-${idAluno}`);
    const situacaoEl = document.getElementById(`situacao-${idAluno}`);

    if (notaFinalEl && result && result.notaFinal !== undefined && result.notaFinal !== null) {
      const notaFinal = parseFloat(result.notaFinal);
      if (!isNaN(notaFinal)) {
        notaFinalEl.textContent = notaFinal.toFixed(2);
        notaFinalEl.className = `text-center fw-bold ${notaFinal >= 6 ? 'text-success' : 'text-danger'}`;
        console.log(`  → Nota final atualizada na tela: ${notaFinal.toFixed(2)}`);
      }
    } else {
      console.warn(`  → Não foi possível atualizar nota final. Elemento:`, !!notaFinalEl, 'Result:', result);
    }

    if (situacaoEl && result && result.situacao) {
      situacaoEl.textContent = result.situacao;
      situacaoEl.className = `text-center ${result.situacao === 'Aprovado' ? 'text-success' : 'text-danger'}`;
      console.log(`  → Situação atualizada na tela: ${result.situacao}`);
    } else {
      console.warn(`  → Não foi possível atualizar situação. Elemento:`, !!situacaoEl, 'Result:', result);
    }

    // A API já salva na tabela notas, então atualizamos a lista local também
    await loadNotasFinais();
  } catch (error) {
    console.error('Erro ao calcular nota final via API:', error);
    // Em caso de erro, calcular localmente como fallback
    calcularNotaFinalLocal(idAluno);
  }
}

// Função fallback para calcular nota final localmente
function calcularNotaFinalLocal(idAluno) {
  // Buscar todas as notas do aluno na turma a partir dos inputs da tabela
  const inputsNota = document.querySelectorAll(`input.nota-input[data-aluno="${idAluno}"]`);
  const notasValidas = [];
  
  inputsNota.forEach(input => {
    const valorStr = input.value.trim();
    if (valorStr !== '' && valorStr !== null) {
      const valor = parseFloat(valorStr);
      if (!isNaN(valor) && valor >= 0 && valor <= 10) {
        notasValidas.push(valor);
      }
    }
  });
  
  const notaFinalEl = document.getElementById(`nota-final-${idAluno}`);
  const situacaoEl = document.getElementById(`situacao-${idAluno}`);

  if (notasValidas.length === 0) {
    if (notaFinalEl) {
      notaFinalEl.textContent = '0.00';
      notaFinalEl.className = 'text-center fw-bold text-danger';
    }
    if (situacaoEl) {
      situacaoEl.textContent = 'Reprovado';
      situacaoEl.className = 'text-center text-danger';
    }
    return;
  }

  // Calcular média simples
  const soma = notasValidas.reduce((acc, n) => acc + n, 0);
  const media = soma / notasValidas.length;
  const situacao = media >= 6 ? 'Aprovado' : 'Reprovado';

  if (notaFinalEl) {
    notaFinalEl.textContent = media.toFixed(2);
    notaFinalEl.className = `text-center fw-bold ${media >= 6 ? 'text-success' : 'text-danger'}`;
  }

  if (situacaoEl) {
    situacaoEl.textContent = situacao;
    situacaoEl.className = `text-center ${situacao === 'Aprovado' ? 'text-success' : 'text-danger'}`;
  }
  
  // Tentar salvar no backend também (em background, sem bloquear)
  calcularNotaFinalAluno(idAluno).catch(err => {
    console.warn('Não foi possível salvar nota final no backend:', err);
  });
}

// Exportação CSV
const btnExportCSV = document.getElementById('btnExportCSV');
if (btnExportCSV) {
  btnExportCSV.addEventListener('click', async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/turmas/${turmaAtual.id}/exportar-notas`, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.getToken()}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao exportar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notas-${turmaAtual.id}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showAlert('CSV exportado com sucesso!', 'success');
    } catch (error) {
      showAlert(error.message || 'Erro ao exportar CSV. Verifique se todas as notas estão preenchidas.', 'danger');
    }
  });
}

// Função para salvar edição de nome ou RA do aluno
async function salvarEdicaoAluno(input) {
  const idAluno = parseInt(input.dataset.alunoId);
  const field = input.dataset.field; // 'nome' ou 'ra'
  const novoValor = input.value.trim();

  if (!novoValor) {
    showAlert(`${field === 'nome' ? 'Nome' : 'RA'} não pode estar vazio.`, 'warning');
    // Restaurar valor anterior
    const aluno = alunos.find(a => a.id === idAluno);
    if (aluno) {
      input.value = aluno[field];
    }
    return;
  }

  // Verificar se o valor mudou
  const aluno = alunos.find(a => a.id === idAluno);
  if (!aluno) {
    showAlert('Aluno não encontrado.', 'danger');
    return;
  }

  if (aluno[field] === novoValor) {
    // Valor não mudou, não precisa salvar
    return;
  }

  try {
    // Adicionar feedback visual
    input.disabled = true;
    input.classList.add('bg-light');

    const response = await apiRequest(`/alunos/${idAluno}`, {
      method: 'PUT',
      body: JSON.stringify({
        nome: field === 'nome' ? novoValor : aluno.nome,
        ra: field === 'ra' ? novoValor : aluno.ra,
      }),
    });

    // Atualizar aluno na lista local
    if (response.aluno) {
      const alunoIndex = alunos.findIndex(a => a.id === idAluno);
      if (alunoIndex >= 0) {
        alunos[alunoIndex] = response.aluno;
      }
      // Atualizar o valor no input para garantir sincronização
      input.value = response.aluno[field];
    }

    // Remover feedback visual
    input.disabled = false;
    input.classList.remove('bg-light');
    
    // Feedback visual de sucesso
    input.classList.add('border-success');
    setTimeout(() => {
      input.classList.remove('border-success');
    }, 1000);

    showAlert(`${field === 'nome' ? 'Nome' : 'RA'} atualizado com sucesso!`, 'success');
  } catch (error) {
    console.error('Erro ao salvar aluno:', error);
    showAlert(error.message || `Erro ao atualizar ${field === 'nome' ? 'nome' : 'RA'}.`, 'danger');
    
    // Restaurar valor anterior
    input.value = aluno[field];
    
    // Remover feedback visual
    input.disabled = false;
    input.classList.remove('bg-light');
  }
}

function setupEventListeners() {
  // Event listeners já configurados nos addEventListener acima
}

