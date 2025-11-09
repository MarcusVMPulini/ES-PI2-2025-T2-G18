import { Request, Response } from "express";
import { Database } from "../config/database";

const db = Database.getInstance();

// ✅ Listar
export const listarDisciplinas = (req: Request, res: Response) => {
  const disciplinas = db.getTable("disciplinas");
  return res.json(disciplinas);
};

// ✅ Criar
export const criarDisciplina = (req: Request, res: Response) => {
  const { nome, idCurso } = req.body;

  if (!nome || !idCurso)
    return res.status(400).json({ message: "Nome e idCurso são obrigatórios" });

  const cursos = db.getTable("cursos");
  const existeCurso = cursos.find((c: any) => c.id == Number(idCurso));

  if (!existeCurso)
    return res.status(404).json({ message: "Curso não encontrado" });

  const disciplinas = db.getTable("disciplinas");
  const nova = { id: Date.now(), nome, idCurso: Number(idCurso) };

  disciplinas.push(nova);
  db.setTable("disciplinas", disciplinas);

  return res.status(201).json({ message: "Disciplina criada", nova });
};

// ✅ Editar
export const editarDisciplina = (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, idCurso } = req.body;

  const disciplinas = db.getTable("disciplinas");
  const index = disciplinas.findIndex((d: any) => d.id == Number(id));

  if (index === -1)
    return res.status(404).json({ message: "Disciplina não encontrada" });

  if (idCurso) {
    const cursos = db.getTable("cursos");
    const existeCurso = cursos.find((c: any) => c.id == Number(idCurso));
    if (!existeCurso)
      return res.status(404).json({ message: "Curso não encontrado" });
    disciplinas[index].idCurso = Number(idCurso);
  }

  if (nome) disciplinas[index].nome = nome;

  db.setTable("disciplinas", disciplinas);

  return res.json({
    message: "Disciplina atualizada",
    disciplina: disciplinas[index],
  });
};

// ✅ Excluir
export const excluirDisciplina = (req: Request, res: Response) => {
  const { id } = req.params;
  const disciplinas = db.getTable("disciplinas");
  const index = disciplinas.findIndex((d: any) => d.id == Number(id));

  if (index === -1)
    return res.status(404).json({ message: "Disciplina não encontrada" });

  disciplinas.splice(index, 1);
  db.setTable("disciplinas", disciplinas);

  return res.json({ message: "Disciplina excluída com sucesso" });
};
