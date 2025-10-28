const express = require('express');
const path = require('path');
const cors = require('cors');

const index = express();
const port = 3000;



app.use(cors());
app.use(express.json());


// === Rota principal ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "../notadez/index.html"));
});

// === Rota de login ===
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  // Usuário fixo para teste
  if (email === 'professor@notadez.com' && senha === '12345678') {
    return res.status(200).json({
      message: 'Login efetuado com sucesso!',
      usuario: { nome: 'Professor', email }
    });
  }
  
    res.status(401).json({ message: 'E-mail ou senha incorretos.' });
});


index.listen(port, () => {
    console.log(`Servidor no Ar na porta ${port}`);
});