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

    return res.json({ message: "Login OK!", token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
