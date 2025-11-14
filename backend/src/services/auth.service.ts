import { query } from "../config/database";

export interface User {
  id?: number;
  nome?: string;
  email: string;
  senha: string;
  telefone?: string;
}

export const authService = {
  // Buscar usuário por email
  findByEmail: async (email: string): Promise<User | null> => {
    const results = await query<User[]>(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar novo usuário
  create: async (nome: string, email: string, hashedPassword: string, telefone?: string): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO usuarios (nome, email, senha, telefone) VALUES (?, ?, ?, ?)",
      [nome, email, hashedPassword, telefone || null]
    ) as any;
    return result.insertId;
  },

  // Buscar usuário por ID
  findById: async (id: number): Promise<User | null> => {
    const results = await query<User[]>(
      "SELECT * FROM usuarios WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },
};

