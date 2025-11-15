// src/core/auth.ts
import { readAnd, writeAnd } from "./storage";
import type { User } from "./types";

export function createUser(nome: string, email: string, telefone: string, senha: string): { ok: boolean; msg?: string; user?: User } {
  // checa duplicidade
  const exists = readAnd(db => db.users.find(u => u.email === email));
  if (exists) {
    return { ok: false, msg: "E-mail já cadastrado" };
  }
  const newUser: User = { id: "user_" + Date.now(), nome, email, telefone, senha };
  writeAnd(db => {
    db.users.push(newUser);
    db.sessions.currentUserId = newUser.id;
  });
  return { ok: true, user: newUser };
}

export function loginUser(email: string, senha: string): { ok: boolean; msg?: string; user?: User } {
  const found = readAnd(db => db.users.find(u => u.email === email && u.senha === senha));
  if (!found) return { ok: false, msg: "Credenciais inválidas" };
  writeAnd(db => { db.sessions.currentUserId = found.id; });
  return { ok: true, user: found };
}

export function getCurrentUser(): User | null {
  return readAnd(db => {
    if (!db.sessions.currentUserId) return null;
    return db.users.find(u => u.id === db.sessions.currentUserId) ?? null;
  });
}

export function logoutUser(): void {
  writeAnd(db => { db.sessions.currentUserId = null; });
}

export function requireAuth(): void {
  const u = getCurrentUser();
  if (!u) {
    window.location.href = "index.html";
  }
}

// utility for UI
export function handleLogoutBtn(): void {
  const btn = document.getElementById("btnLogout") as HTMLButtonElement | null;
  if (!btn) return;
  btn.addEventListener("click", () => {
    logoutUser();
    window.location.href = "index.html";
  });
}
