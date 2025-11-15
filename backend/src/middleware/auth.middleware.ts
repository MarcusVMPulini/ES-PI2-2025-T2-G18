import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = "segredo_super_secreto";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "Token não informado!" });

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.body.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido!" });
  }
};
