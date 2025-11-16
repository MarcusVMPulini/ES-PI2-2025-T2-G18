const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Para enviar e-mails

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

// Configure seu SMTP real ou use Gmail
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "seuemail@gmail.com",
    pass: "suasenha"
  }
});

// Rota de recuperação de senha
app.post('/api/recuperar-senha', (req, res) => {
  const { email } = req.body;
  const usuario = usuarios.find(u => u.email === email);

  if (!usuario) return res.status(404).json({ message: "E-mail não encontrado." });

  // Criar token simples (em produção use JWT ou UUID)
  const token = Math.random().toString(36).substring(2, 15);
  usuario.token = token; // salvar token no mock

  const link = `http://localhost:3000/redefinir-senha.html?token=${token}&email=${email}`;

  const mailOptions = {
    from: "seuemail@gmail.com",
    to: email,
    subject: "Redefinir senha NotaDez",
    text: `Clique no link para redefinir sua senha: ${link}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro ao enviar e-mail." });
    }
    res.json({ message: "E-mail de redefinição enviado com sucesso!" });
  });
});