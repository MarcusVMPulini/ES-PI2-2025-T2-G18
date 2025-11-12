import express from "express";
import connection from "../database.js";
const router = express.Router();

router.get("/", (req, res) => {
  connection.query("SELECT * FROM disciplinas", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { ID_Disciplinas, Instituicao_ID, nome, sigla, codigo, periodo } = req.body;
  connection.query(
    "INSERT INTO disciplinas VALUES (?, ?, ?, ?, ?, ?, NOW())",
    [ID_Disciplinas, Instituicao_ID, nome, sigla, codigo, periodo],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ msg: "Disciplina criada!" });
    }
  );
});

export default router;