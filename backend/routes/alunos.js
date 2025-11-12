import express from "express";
import connection from "../database.js";
const router = express.Router();

router.get("/:turmaId", (req, res) => {
  const { turmaId } = req.params;
  connection.query("SELECT * FROM alunos WHERE Turma_ID = ?", [turmaId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { ID_Alunos, Turma_ID, matricula, nome } = req.body;
  connection.query(
    "INSERT INTO alunos VALUES (?, ?, ?, ?, NOW())",
    [ID_Alunos, Turma_ID, matricula, nome],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ msg: "Aluno adicionado!" });
    }
  );
});

export default router;