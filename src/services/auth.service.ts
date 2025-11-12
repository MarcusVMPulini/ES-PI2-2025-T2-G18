import { query } from "../config/database";

export interface User {
  id?: number;
  email: string;
  password: string;
}

export const authService = {
  // Buscar usuário por email
  findByEmail: async (email: string): Promise<User | null> => {
    const results = await query<User[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return results.length > 0 ? results[0] : null;
  },

  // Criar novo usuário
  create: async (email: string, hashedPassword: string): Promise<number> => {
    const result = await query<any>(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    ) as any;
    return result.insertId;
  },

  // Buscar usuário por ID
  findById: async (id: number): Promise<User | null> => {
    const results = await query<User[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  },
};

