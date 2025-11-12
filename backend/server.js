const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connection = require("./database.js");

// Importação das rotas
const usuariosRoutes = require("./routes/usuarios.js");
const instituicoesRoutes = require("./routes/instituicoes.js");
const disciplinasRoutes = require("./routes/disciplinas.js");
const turmasRoutes = require("./routes/turma.js");
const alunosRoutes = require("./routes/alunos.js");
const componentesRoutes = require("./routes/componentes.js");
const notasRoutes = require("./routes/notas.js");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rotas principais
app.use("/usuarios", usuariosRoutes);
app.use("/instituicoes", instituicoesRoutes);
app.use("/disciplinas", disciplinasRoutes);
app.use("/turma", turmasRoutes);
app.use("/alunos", alunosRoutes);
app.use("/componentes", componentesRoutes);
app.use("/notas", notasRoutes);

// Conexão com o banco (opcional, só pra testar se conecta)
connection.connect((err) => {
  if (err) {
    console.error(" Erro ao conectar no banco de dados:", err);
  } else {
    console.log(" Conectado ao banco de dados MySQL com sucesso!");
  }
});

// Inicializa servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});