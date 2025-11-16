// Autenticação - Login e Cadastro

// === LOGIN ===
document.addEventListener('DOMContentLoaded', () => {
  // Tentar encontrar o botão de login de várias formas
  const loginButton = document.getElementById('btnLogin') ||
                      document.querySelector('#login button.btn-outline-primary') || 
                      document.querySelector('#login button') ||
                      document.querySelector('button[type="button"].btn-outline-primary');
  
  if (loginButton) {
    console.log('Botão de login encontrado, adicionando evento...');
    loginButton.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogin();
    });
  } else {
    console.error('Botão de login não encontrado!');
    // Tentar adicionar após um pequeno delay
    setTimeout(() => {
      const btn = document.getElementById('btnLogin') || document.querySelector('#login button');
      if (btn) {
        console.log('Botão encontrado no retry, adicionando evento...');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          handleLogin();
        });
      } else {
        console.error('Botão ainda não encontrado após retry!');
      }
    }, 100);
  }

  const cadastroButton = document.getElementById('btncriarconta');
  if (cadastroButton) {
    cadastroButton.addEventListener('click', handleCadastro);
  }

  const logoutButton = document.querySelector('.logout-btn, #logoutBtn');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logout();
    });
  }

  // Verificar se já está logado
  if (API_CONFIG.getToken() && window.location.pathname.includes('index.html')) {
    window.location.href = 'dashbord.html';
  }
});

async function handleLogin() {
  console.log('handleLogin chamado');
  const email = document.getElementById('inputemail')?.value.trim();
  const senha = document.getElementById('inputPassword6')?.value.trim();

  console.log('Email:', email ? 'preenchido' : 'vazio');
  console.log('Senha:', senha ? 'preenchida' : 'vazia');

  if (!email || !senha) {
    showAlert('Preencha todos os campos.', 'warning');
    return;
  }

  if (!validateEmail(email)) {
    showAlert('E-mail inválido.', 'warning');
    return;
  }

  try {
    console.log('Fazendo requisição de login...');
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    console.log('Resposta do login:', data);

    if (data.token) {
      console.log('Token recebido, salvando...');
      console.log('Token (primeiros 20 chars):', data.token.substring(0, 20) + '...');
      API_CONFIG.setToken(data.token);
      
      // Verificar se foi salvo
      const savedToken = API_CONFIG.getToken();
      console.log('Token salvo?', savedToken ? 'SIM' : 'NÃO');
      console.log('Token salvo (primeiros 20 chars):', savedToken ? savedToken.substring(0, 20) + '...' : 'N/A');
      
      // Salvar informações básicas do usuário (se disponíveis)
      if (data.user) {
        console.log('Dados do usuário recebidos:', data.user);
        API_CONFIG.setUser(data.user);
      } else {
        // Se não tiver user na resposta, criar objeto básico
        console.log('Criando objeto de usuário básico...');
        API_CONFIG.setUser({ nome: email.split('@')[0], email });
      }
      
      // Verificar se user foi salvo
      const savedUser = API_CONFIG.getUser();
      console.log('Usuário salvo?', savedUser ? 'SIM' : 'NÃO');
      console.log('Usuário salvo:', savedUser);
      
      showAlert('Login efetuado com sucesso!', 'success');
      console.log('Redirecionando para dashboard em 1 segundo...');
      setTimeout(() => {
        console.log('Redirecionando agora para dashbord.html...');
        // Verificar token antes de redirecionar
        const tokenBeforeRedirect = API_CONFIG.getToken();
        console.log('Token antes do redirecionamento:', tokenBeforeRedirect ? 'existe' : 'não existe');
        
        // Tentar múltiplas formas de redirecionamento
        try {
          window.location.href = 'dashbord.html';
        } catch (e) {
          console.error('Erro ao redirecionar com href:', e);
          try {
            window.location.replace('dashbord.html');
          } catch (e2) {
            console.error('Erro ao redirecionar com replace:', e2);
            window.location = 'dashbord.html';
          }
        }
      }, 1000);
    } else {
      console.error('Token não encontrado na resposta:', data);
      showAlert('Erro: Token não recebido do servidor.', 'danger');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    showAlert(error.message || 'E-mail ou senha incorretos.', 'danger');
  }
}

async function handleCadastro() {
  const nome = document.getElementById('inputNomeCadastro')?.value.trim();
  const email = document.getElementById('inputemailCadastro')?.value.trim();
  const senha = document.getElementById('inputPasswordCadastro')?.value.trim();
  const confirmarSenha = document.getElementById('inputPasswordCastro')?.value.trim();

  if (!nome || !email || !senha || !confirmarSenha) {
    showAlert('Preencha todos os campos.', 'warning');
    return;
  }

  if (!validateEmail(email)) {
    showAlert('E-mail inválido.', 'warning');
    return;
  }

  if (senha.length < 8) {
    showAlert('A senha deve ter no mínimo 8 caracteres.', 'warning');
    return;
  }

  if (senha !== confirmarSenha) {
    showAlert('As senhas não coincidem.', 'warning');
    return;
  }

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        nome,
        email,
        senha,
        telefone: '', // Opcional
      }),
    });

    showAlert('Conta criada com sucesso! Redirecionando...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  } catch (error) {
    showAlert(error.message || 'Erro ao criar conta.', 'danger');
  }
}

