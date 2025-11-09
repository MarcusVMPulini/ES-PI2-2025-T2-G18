import { Request, Response } from "express";
import { Database } from "../config/database";

const db = Database.getInstance();

// ✅ Listar todos os cursos
export const listarCursos = (req: Request, res: Response) => {
  const cursos = db.getTable("cursos");
  return res.json(cursos);
};

// ✅ Criar curso
export const criarCurso = (req: Request, res: Response) => {
  const { nome, idInstituicao } = req.body;

  if (!nome || !idInstituicao)
    return res.status(400).json({ message: "Nome e idInstituicao são obrigatórios" });

  const instituicoes = db.getTable("instituicoes");
  const existeInstituicao = instituicoes.find((i: any) => i.id == Number(idInstituicao));

  if (!existeInstituicao)
    return res.status(404).json({ message: "Instituição não encontrada" });

  const cursos = db.getTable("cursos");
  const novo = { id: Date.now(), nome, idInstituicao: Number(idInstituicao) };

  cursos.push(novo);
  db.setTable("cursos", cursos);

  return res.status(201).json({ message: "Curso criado", novo });
};

// ✅ Editar curso
export const editarCurso = (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, idInstituicao } = req.body;

  const cursos = db.getTable("cursos");
  const index = cursos.findIndex((c: any) => c.id == Number(id));

  if (index === -1)
    return res.status(404).json({ message: "Curso não encontrado" });

  cursos[index].nome = nome ?? cursos[index].nome;
  cursos[index].idInstituicao = idInstituicao ?? cursos[index].idInstituicao;

  db.setTable("cursos", cursos);
  return res.json({ message: "Curso atualizado", curso: cursos[index] });
};

// ✅ Excluir curso
export const excluirCurso = (req: Request, res: Response) => {
  const { id } = req.params;
  const cursos = db.getTable("cursos");
  const index = cursos.findIndex((c: any) => c.id == Number(id));

  if (index === -1)
    return res.status(404).json({ message: "Curso não encontrado" });

  cursos.splice(index, 1);
  db.setTable("cursos", cursos);

  return res.json({ message: "Curso excluído com sucesso" });
};
