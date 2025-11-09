import { Request, Response } from "express";
import { Database } from "../config/database";

const db = Database.getInstance();

export const listarInstituicoes = (req: Request, res: Response) => {
  const instituicoes = db.getTable("instituicoes");
  return res.json(instituicoes);
};

export const criarInstituicao = (req: Request, res: Response) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ message: "Nome é obrigatório" });

  const instituicoes = db.getTable("instituicoes");
  const nova = { id: Date.now(), nome };

  instituicoes.push(nova);
  db.setTable("instituicoes", instituicoes);

  return res.status(201).json({ message: "Instituição criada", nova });
};

export const editarInstituicao = (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome } = req.body;

  const instituicoes = db.getTable("instituicoes");
  const index = instituicoes.findIndex((i: any) => i.id == Number(id));

  if (index === -1)
    return res.status(404).json({ message: "Instituição não encontrada" });

  instituicoes[index].nome = nome;
  db.setTable("instituicoes", instituicoes);

  return res.json({ message: "Instituição atualizada", instituicao: instituicoes[index] });
};

export const excluirInstituicao = (req: Request, res: Response) => {
  const { id } = req.params;
  const instituicoes = db.getTable("instituicoes");
  const index = instituicoes.findIndex((i: any) => i.id == Number(id));

  if (index === -1)
    return res.status(404).json({ message: "Instituição não encontrada" });

  instituicoes.splice(index, 1);
  db.setTable("instituicoes", instituicoes);

  return res.json({ message: "Instituição excluída" });
};
