//Autores: Marcus, Leonel

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authService } from "../services/auth.service";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios" });
    }

    const userExists = await authService.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: "Usuário já cadastrado!" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    await authService.create(nome, email, hashedPassword, telefone);

    return res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    const user = await authService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas!" });
    }

    const validPassword = await bcrypt.compare(senha, user.senha);

    if (!validPassword) {
      return res.status(401).json({ message: "Credenciais inválidas!" });
    }

    const token = jwt.sign({ email, id: user.id }, SECRET, { expiresIn: "2h" });

    return res.json({ message: "Login OK!", token, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Recuperação de senha - solicitar reset
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email é obrigatório" });
    }

    const user = await authService.findByEmail(email);
    
    // Por segurança, sempre retornamos sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (user) {
      // Em produção, aqui enviaria um email com token de reset
      // Por enquanto, apenas logamos (em produção, remover este log)
      console.log(`[DEV] Reset de senha solicitado para: ${email}`);
      // TODO: Implementar envio de email com token de reset
    }

    return res.json({ 
      message: "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha." 
    });
  } catch (error) {
    console.error("Erro ao processar solicitação de reset:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Recuperação de senha - redefinir com token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, novaSenha } = req.body;

    if (!email || !token || !novaSenha) {
      return res.status(400).json({ message: "Email, token e nova senha são obrigatórios" });
    }

    if (novaSenha.length < 8) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 8 caracteres" });
    }

    // Em produção, validar o token recebido por email
    // Por enquanto, apenas validamos que o usuário existe
    const user = await authService.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // TODO: Validar token de reset (deve ser armazenado no banco com expiração)
    // Por enquanto, apenas atualizamos a senha (NÃO FAZER ISSO EM PRODUÇÃO SEM VALIDAÇÃO DE TOKEN)

    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    await authService.updatePassword(user.id!, hashedPassword);

    return res.json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
