import express from "express";
import connection from "../database.js";
const router = express.Router();

router.get("/:alunoId", (req, res) => {
  const { alunoId } = req.params;
  connection.query("SELECT * FROM notas WHERE ID_Aluno = ?", [alunoId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { ID_Aluno, ID_Componente, valor } = req.body;
  connection.query(
    "INSERT INTO notas (ID_Aluno, ID_Componente, valor) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE valor = ?",
    [ID_Aluno, ID_Componente, valor, valor],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ msg: "Nota registrada!" });
    }
  );
});

export default router;