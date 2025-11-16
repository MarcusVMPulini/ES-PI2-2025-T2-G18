// Turma - Gerenciamento de Componentes, Alunos e Notas

let turmaAtual = null;
let disciplinaAtual = null;
let componentes = [];
let alunos = [];
let notas = [];
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
      await apiRequest(`/componentes-nota/disciplina/${disciplinaAtual.id}`, {
        method: 'POST',
        body: JSON.stringify({
          nome: formData.get('nomeComp'),
          sigla: formData.get('sigla').toUpperCase(),
          descricao: formData.get('descricao'),
        }),
      });

      showAlert('Componente criado com sucesso!', 'success');
      e.target.reset();
      await loadComponentes();
      await loadNotas(); // Recarregar tabela de notas
    } catch (error) {
      showAlert(error.message || 'Erro ao criar componente.', 'danger');
    }
  });
}

async function deleteComponente(id) {
  if (!confirm('Tem certeza que deseja excluir este componente?')) return;

  try {
    await apiRequest(`/componentes-nota/${id}`, { method: 'DELETE' });
    showAlert('Componente excluído com sucesso!', 'success');
    await loadComponentes();
    await loadNotas();
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
          </tr>
        </thead>
        <tbody>
  `;

  alunos.forEach(aluno => {
    html += `<tr>`;
    html += `<td>${aluno.ra}</td>`;
    html += `<td>${aluno.nome}</td>`;

    componentes.forEach(comp => {
      const nota = notas.find(n => n.idAluno === aluno.id && n.idComponente === comp.id);
      const valor = nota ? nota.valor.toFixed(2) : '-';
      const notaId = nota ? nota.id : null;

      html += `<td>
        <input 
          type="number" 
          class="form-control form-control-sm nota-input" 
          data-aluno="${aluno.id}" 
          data-componente="${comp.id}"
          data-nota-id="${notaId || ''}"
          value="${valor === '-' ? '' : valor}"
          min="0" 
          max="10" 
          step="0.01"
          placeholder="-"
          onchange="salvarNota(this)"
        />
      </td>`;
    });

    // Calcular nota final (será atualizado via API)
    html += `<td id="nota-final-${aluno.id}" class="text-center">-</td>`;
    html += `<td id="situacao-${aluno.id}" class="text-center">-</td>`;
    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Calcular notas finais
  alunos.forEach(aluno => {
    calcularNotaFinalAluno(aluno.id);
  });
}

async function salvarNota(input) {
  const idAluno = parseInt(input.dataset.aluno);
  const idComponente = parseInt(input.dataset.componente);
  const valor = parseFloat(input.value);

  if (isNaN(valor) || valor < 0 || valor > 10) {
    showAlert('Valor deve estar entre 0.00 e 10.00', 'warning');
    input.value = '';
    return;
  }

  try {
    await apiRequest(`/notas-componente/turma/${turmaAtual.id}/componente/${idComponente}`, {
      method: 'POST',
      body: JSON.stringify({
        idAluno,
        valor,
      }),
    });

    // Atualizar nota final
    await calcularNotaFinalAluno(idAluno);
    await loadNotas(); // Recarregar para atualizar IDs
  } catch (error) {
    showAlert(error.message || 'Erro ao salvar nota.', 'danger');
    input.value = '';
  }
}

async function calcularNotaFinalAluno(idAluno) {
  try {
    const result = await apiRequest(`/notas-componente/turma/${turmaAtual.id}/aluno/${idAluno}/nota-final`);
    const notaFinalEl = document.getElementById(`nota-final-${idAluno}`);
    const situacaoEl = document.getElementById(`situacao-${idAluno}`);

    if (notaFinalEl) {
      notaFinalEl.textContent = result.notaFinal.toFixed(2);
      notaFinalEl.className = `text-center fw-bold ${result.notaFinal >= 6 ? 'text-success' : 'text-danger'}`;
    }

    if (situacaoEl) {
      situacaoEl.textContent = result.situacao;
      situacaoEl.className = `text-center ${result.situacao === 'Aprovado' ? 'text-success' : 'text-danger'}`;
    }
  } catch (error) {
    console.error('Erro ao calcular nota final:', error);
  }
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

function setupEventListeners() {
  // Event listeners já configurados nos addEventListener acima
}

