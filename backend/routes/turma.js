import express from "express";
import connection from "../database.js";
const router = express.Router();

router.get("/", (req, res) => {
  connection.query("SELECT * FROM turmas", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { Turmas_ID, Disciplina_ID, nome, apelido } = req.body;
  connection.query(
    "INSERT INTO turmas VALUES (?, ?, ?, ?, NOW())",
    [Turmas_ID, Disciplina_ID, nome, apelido],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ msg: "Turma criada!" });
    }
  );
});

export default router;