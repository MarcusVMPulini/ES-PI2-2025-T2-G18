const express = require('express');
const path = require('path');
const cors = require('cors');

const index = express();
const port = 3000;



app.use(cors());
app.use(express.json());


// === Rota principal ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "../Front-End/index.html"));
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

app.get('/api/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, "../Front-End/index.html"))
})

app.post('/api/cadastro', (req, res) => {
  const { email, senha, confirmarSenha } = req.body;
  // Validações
  if (!nome || !email || !senha || !confirmarSenha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  if (senha !== confirmarSenha) {
    return res.status(400).json({ message: 'As senhas não coincidem.' });
  }

  if (senha.length < 8) {
    return res.status(400).json({ message: 'A senha deve ter no mínimo 8 caracteres.' });
  }

  // Verificar se email já existe
  const usuarioExistente = usuarios.find(u => u.email === email);
  if (usuarioExistente) {
    return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
  }

  // Criar novo usuário
  const novoUsuario = {
    id: usuarios.length + 1,
    nome,
    email,
    senha
  };

  usuarios.push(novoUsuario);

  res.status(201).json({
    message: 'Conta criada com sucesso!',
    usuario: {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email
    }
  });
});
