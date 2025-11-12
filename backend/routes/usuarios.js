import express from "express";
import connection from "../database.js";
const router = express.Router();

// Login
router.post("/login", (req, res) => {
  const { email, senha } = req.body;
  connection.query(
    "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
    [email, senha],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(401).json({ msg: "Usuário ou senha inválidos" });
      res.json(results[0]);
    }
  );
});

// Criar usuário
router.post("/", (req, res) => {
  const { id, nome, email, telefone, senha } = req.body;
  connection.query(
    "INSERT INTO usuarios (id, nome, email, telefone, senha) VALUES (?, ?, ?, ?, ?)",
    [id, nome, email, telefone, senha],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ msg: "Usuário criado com sucesso!" });
    }
  );
});

export default router;