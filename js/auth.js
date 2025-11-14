// Função que simula o login (você pode substituir depois pela chamada ao backend)
function loginUser(email, senha) {
  // Exemplo de validação simples (substituir por API real)
  if (email === "professor@notadez.com" && senha === "12345678") {
    localStorage.setItem("user", JSON.stringify({ email }));
    return { ok: true, msg: "Login bem-sucedido!" };
  }
  return { ok: false, msg: "E-mail ou senha inválidos." };
}

// Retorna o usuário logado do localStorage
function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// Faz logout limpando o localStorage
function logoutUser() {
  localStorage.removeItem("user");
}

// Exige autenticação (para páginas internas)
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
  }
  return user;
}

// Handler de login adaptado para seu HTML
function handleLoginPage() {
  const btnLogin = document.querySelector("button.btn-outline-primary");
  const inputEmail = document.getElementById("inputemail");
  const inputSenha = document.getElementById("inputPassword6");
  const forgotLink = document.getElementById("forgotpassword");
  const msgContainer = document.createElement("div");

  // Área para mostrar mensagens
  msgContainer.id = "loginMsg";
  msgContainer.style.marginTop = "10px";
  document.getElementById("login").appendChild(msgContainer);

  // Ao clicar no botão "Entrar"
  if (btnLogin) {
    btnLogin.addEventListener("click", function () {
      const email = inputEmail.value.trim();
      const senha = inputSenha.value.trim();

      if (!email || !senha) {
        msgContainer.textContent = "Preencha todos os campos!";
        msgContainer.style.color = "red";
        return;
      }

      const r = loginUser(email, senha);
      if (r.ok) {
        msgContainer.textContent = r.msg;
        msgContainer.style.color = "green";
        // Redireciona após um curto delay
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);
      } else {
        msgContainer.textContent = r.msg;
        msgContainer.style.color = "red";
      }
    });
  }

  // Link "Esqueci a senha"
  if (forgotLink) {
    forgotLink.addEventListener("click", function (e) {
      e.preventDefault();
      const email = inputEmail.value.trim();
      if (!email) {
        alert("Digite seu e-mail para recuperar a senha.");
        return;
      }
      alert(`Um e-mail de recuperação foi enviado para ${email}`);
      // Aqui você chamaria o endpoint real do backend
    });
  }
}

// Chamada inicial quando a página carrega
document.addEventListener("DOMContentLoaded", handleLoginPage);