//Autor: Marcus

import { Request, Response, NextFunction } from "express"; 
// Importa os tipos do Express para tipar req, res e next

import jwt from "jsonwebtoken"; 
// Biblioteca responsável por criar e validar tokens JWT

import dotenv from "dotenv"; 
// Usado para carregar variáveis de ambiente (.env)

dotenv.config(); 
// Carrega o arquivo .env para process.env

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";
// Chave secreta usada para validar tokens JWT
// Caso não exista JWT_SECRET no .env, usa um valor padrão

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => { 
  // Middleware de autenticação que verifica se o token do usuário é válido

  const authHeader = req.headers.authorization;
  // Busca o header "Authorization" que deve vir com "Bearer <token>"

  if (!authHeader) {
    // Se nenhum token foi enviado no header
    return res.status(401).json({ message: "Token não informado!" });
  }

  const parts = authHeader.split(" ");
  // Divide o header em duas partes: ["Bearer", "<token>"]

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    // Se o formato for inválido (ex: não tem 2 partes ou não começa com "Bearer")
    return res.status(401).json({ message: "Formato de token inválido!" });
  }

  const token = parts[1];
  // A segunda parte é o token JWT em si

  try {
    const decoded = jwt.verify(token, SECRET);
    // Verifica o token usando a chave secreta
    // Se for válido, retorna os dados decodificados (id, email, etc.)

    (req as any).user = decoded;
    // Anexa os dados do usuário ao objeto req
    // Permite acessar req.user em outras rotas

    next();
    // Permite que a requisição continue para o próximo middleware/rota
  } catch (error) {
    // Caso o token seja inválido, modificado ou expirado
    console.error("Erro ao verificar token:", error);
    return res.status(401).json({ message: "Token inválido ou expirado!" });
  }
};
