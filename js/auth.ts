// Definição de tipo para usuário
interface User {
  email: string;
}

// Função de login
function loginUser(email: string, senha: string): { ok: boolean; msg: string } {
  // Exemplo de validação simples (substituir por API real)
  if (email === "professor@notadez.com" && senha === "12345678") {
    const user: User = { email };
    localStorage.setItem("user", JSON.stringify(user));
    return { ok: true, msg: "Login bem-sucedido!" };
  }
  return { ok: false, msg: "E-mail ou senha inválidos." };
}

// Retorna o usuário logado do localStorage
function getCurrentUser(): User | null {
  const user = localStorage.getItem("user");
  return user ? (JSON.parse(user) as User) : null;
}

// Faz logout limpando o localStorage
function logoutUser(): void {
  localStorage.removeItem("user");
}

// Exige autenticação (para páginas internas)
function requireAuth(): User | void {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  return user;
}

// Handler de login adaptado para o HTML
function handleLoginPage(): void {
  const btnLogin = document.querySelector<HTMLButtonElement>("button.btn-outline-primary");
  const inputEmail = document.getElementById("inputemail") as HTMLInputElement | null;
  const inputSenha = document.getElementById("inputPassword6") as HTMLInputElement | null;
  const forgotLink = document.getElementById("forgotpassword") as HTMLAnchorElement | null;
  const loginContainer = document.getElementById("login");

  if (!loginContainer) return;

  const msgContainer = document.createElement("div");
  msgContainer.id = "loginMsg";
  msgContainer.style.marginTop = "10px";
  loginContainer.appendChild(msgContainer);

  // Ao clicar no botão "Entrar"
  if (btnLogin && inputEmail && inputSenha) {
    btnLogin.addEventListener("click", () => {
      const email = inputEmail.value.trim();
      const senha = inputSenha.value.trim();

      if (!email || !senha) {
        msgContainer.textContent = "Preencha todos os campos!";
        msgContainer.style.color = "red";
        return;
      }

      const r = loginUser(email, senha);
      msgContainer.textContent = r.msg;
      msgContainer.style.color = r.ok ? "green" : "red";

      if (r.ok) {
        // Redireciona após um curto delay
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);
      }
    });
  }

  // Link "Esqueci a senha"
  if (forgotLink && inputEmail) {
    forgotLink.addEventListener("click", (e: MouseEvent) => {
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