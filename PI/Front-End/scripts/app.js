// index.js - Lógica de autenticação NotaDez (frontend)

// === Configuração básica ===
const API_URL = "http://localhost:3000/api"; // altere para o backend real
const useMock = true; // coloque false quando tiver o servidor rodando

// === Selecionar elementos ===
const emailInput = document.getElementById("inputemail");
const passwordInput = document.getElementById("inputPassword6");
const loginButton = document.querySelector("#login button");

// === Adicionar evento de clique no botão ===
loginButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const senha = passwordInput.value.trim();

  // Validação simples
  if (!email || !senha) {
    showAlert("Preencha todos os campos.", "warning");
    return;
  }

  if (!validateEmail(email)) {
    showAlert("E-mail inválido.", "warning");
    return;
  }

  if (senha.length < 8) {
    showAlert("A senha deve ter no mínimo 8 caracteres.", "warning");
    return;
  }

  // Envio para o backend ou simulação
  if (useMock) {
    await mockLogin(email, senha);
  } else {
    await realLogin(email, senha);
  }
});

// === Função de login real (chamada à API) ===
async function realLogin(email, senha) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert("Login efetuado com sucesso!", "success");
      // Exemplo: redirecionar
      setTimeout(() => (window.location.href = "/dashboard.html"), 1500);
    } else {
      showAlert(data.message || "Falha ao autenticar.", "danger");
    }
  } catch (error) {
    console.error(error);
    showAlert("Erro de conexão com o servidor.", "danger");
  }
}

// === Função simulada (mock) para testes sem backend ===
async function mockLogin(email, senha) {
  showAlert("Validando...", "info");
  await delay(1000);

  // Simulando usuário de teste
  if (email === "professor@notadez.com" && senha === "12345678") {
    showAlert("Login efetuado com sucesso!", "success");
    setTimeout(() => {
      document.body.innerHTML = `
        <main style="display:flex;align-items:center;justify-content:center;height:100vh;">
          <div>
            <h2>Bem-vindo(a) ao NotaDez!</h2>
            <p>Você está autenticado como <b>${email}</b>.</p>
          </div>
        </main>
      `;
    }, 1000);
  } else {
    showAlert("E-mail ou senha incorretos.", "danger");
  }
}

// === Funções utilitárias ===
function showAlert(message, type = "info") {
  const existing = document.querySelector(".alert");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.className = `alert alert-${type} mt-3`;
  div.role = "alert";
  div.textContent = message;

  const loginDiv = document.getElementById("login");
  loginDiv.appendChild(div);

  // remove após 4 segundos
  setTimeout(() => div.remove(), 4000);
}

function validateEmail(email) {
  const regex = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/;
  return regex.test(email);
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

//Fucao que vai/volta para a pagina de cadastro: 
function irParaCadastro() {
  window.location.href = "cadastro.html";
}
//funcao que vai/volta para a pagina de login: 
function irParaLogin() {
  window.location.href = "index.html";
}

//funcao que vai/volta para pagina esqueci a senha: 

function IrParaEsqueciaSenha() {
  window.location.href = "EsqueciSenha.html";
}