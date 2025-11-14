// Definição de tipo para usuário
interface User {
  email: string;
}

// Função de login
import express from "express";
import { pool } from "../backend/database.js";

const router = express.Router();

// Lista turmas de um professor
router.get("/:disciplinaId", async (req, res) => {
  const { disciplinaId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM turmas WHERE Disciplina_ID = ?",
      [disciplinaId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar turmas" });
  }
});

// Adiciona turma
router.post("/", async (req, res) => {
  const { Disciplina_ID, nome, apelido } = req.body;
  try {
    await pool.query(
      "INSERT INTO turmas (Turmas_ID, Disciplina_ID, nome, apelido) VALUES (UUID(), ?, ?, ?)",
      [Disciplina_ID, nome, apelido]
    );
    res.json({ ok: true, msg: "Turma criada com sucesso!" });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Erro ao criar turma" });
  }
});

export default router;

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