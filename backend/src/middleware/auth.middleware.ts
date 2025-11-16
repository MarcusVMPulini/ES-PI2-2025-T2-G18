import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado!" });
  }

  const parts = authHeader.split(" ");
  
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Formato de token inválido!" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    // Adicionar informações do usuário ao request
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res.status(401).json({ message: "Token inválido ou expirado!" });
  }
};
