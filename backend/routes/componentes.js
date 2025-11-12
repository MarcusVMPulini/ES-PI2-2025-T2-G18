import express from "express";
import connection from "../database.js";
const router = express.Router();

router.get("/:disciplinaId", (req, res) => {
  const { disciplinaId } = req.params;
  connection.query(
    "SELECT * FROM componentes WHERE Disciplina_ID = ?",
    [disciplinaId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

router.post("/", (req, res) => {
  const { Componentes_ID, Disciplina_ID, nome, sigla, descricao } = req.body;
  connection.query(
    "INSERT INTO componentes VALUES (?, ?, ?, ?, ?, NOW())",
    [Componentes_ID, Disciplina_ID, nome, sigla, descricao],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ msg: "Componente criado!" });
    }
  );
});

export default router;