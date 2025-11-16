// Configuração da API
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  getUser: () => JSON.parse(localStorage.getItem('user') || 'null'),
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),
};

// Função para fazer requisições autenticadas
async function apiRequest(endpoint, options = {}) {
  const token = API_CONFIG.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`[apiRequest] Token encontrado, enviando para: ${endpoint}`);
  } else {
    console.warn(`[apiRequest] Token não encontrado para: ${endpoint}`);
  }

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Tentar parsear JSON, mas tratar caso não seja JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'Erro na requisição');
    }

    if (!response.ok) {
      // Se for erro 401 (não autorizado), fazer logout
      if (response.status === 401) {
        console.error('Erro 401 - Token inválido ou expirado');
        console.error('Resposta:', data);
        API_CONFIG.removeToken();
        API_CONFIG.removeUser();
        // Só redirecionar se não estiver já na página de login
        if (!window.location.pathname.includes('index.html') && 
            !window.location.href.includes('index.html')) {
          console.log('Redirecionando para login devido a erro 401...');
          window.location.href = 'index.html';
        }
      }
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    
    // Tratar erros de rede
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    }
    
    throw error;
  }
}

// Função para mostrar alertas
function showAlert(message, type = 'info', container = document.body) {
  const existing = container.querySelector('.alert');
  if (existing) existing.remove();

  const div = document.createElement('div');
  div.className = `alert alert-${type} alert-dismissible fade show mt-3`;
  div.role = 'alert';
  div.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  container.insertBefore(div, container.firstChild);

  setTimeout(() => div.remove(), 5000);
}

// Função para validar email
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Função para verificar se está autenticado
function checkAuth() {
  const token = API_CONFIG.getToken();
  console.log('checkAuth - Token:', token ? 'existe' : 'não existe');
  
  if (!token) {
    console.log('Token não encontrado, redirecionando para login...');
    window.location.href = 'index.html';
    return false;
  }
  
  console.log('Token encontrado, autenticação OK');
  return true;
}

// Função para fazer logout
function logout() {
  API_CONFIG.removeToken();
  API_CONFIG.removeUser();
  window.location.href = 'index.html';
}

