import express from "express";
import connection from "../database.js";
const router = express.Router();

router.get("/", (req, res) => {
  connection.query("SELECT * FROM instituicoes", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { id, user_ID, nome_Instituicao, nome_Curso } = req.body;
  connection.query(
    "INSERT INTO instituicoes (id, user_ID, nome_Instituicao, nome_Curso) VALUES (?, ?, ?, ?)",
    [id, user_ID, nome_Instituicao, nome_Curso],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ msg: "Instituição criada!" });
    }
  );
});

export default router;