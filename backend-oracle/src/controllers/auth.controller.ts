import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface User {
  email: string;
  password: string;
}

let users: User[] = []; // Mock temporário

const SECRET = "segredo_super_secreto"; // depois vamos para o .env

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userExists = users.find(u => u.email === email);
  if (userExists)
    return res.status(400).json({ message: "Usuário já cadastrado!" });

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ email, password: hashedPassword });

  return res.status(201).json({ message: "Usuário registrado com sucesso!" });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user)
    return res.status(401).json({ message: "Credenciais inválidas!" });

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword)
    return res.status(401).json({ message: "Credenciais inválidas!" });

  const token = jwt.sign({ email }, SECRET, { expiresIn: "2h" });

  return res.json({ message: "Login OK!", token });
};
