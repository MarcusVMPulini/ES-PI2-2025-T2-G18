# NotaDez - Front-End

Front-end do sistema NotaDez conectado ao backend.

## 🚀 Como Usar

### 1. Configuração

Certifique-se de que o backend está rodando em `http://localhost:3000`

### 2. Abrir o Front-End

Abra o arquivo `index.html` no navegador ou use um servidor local:

```bash
# Com Python
python -m http.server 8000

# Com Node.js (http-server)
npx http-server -p 8000
```

Acesse: `http://localhost:8000`

### 3. Fluxo de Uso

1. **Login/Cadastro**
   - Faça login ou crie uma conta
   - O token JWT será salvo automaticamente

2. **Dashboard**
   - Crie Instituição + Curso
   - Crie Disciplinas
   - Crie Turmas

3. **Gerenciar Turma**
   - Clique em "Abrir Turma" ou "Ver Turmas"
   - Cadastre Componentes de Nota (P1, P2, P3, etc.)
   - Adicione alunos (manual ou CSV)
   - Lance notas por componente
   - Exporte CSV quando todas as notas estiverem preenchidas

## 📁 Estrutura de Arquivos

```
Front-End/
├── index.html          # Tela de login
├── cadastro.html       # Tela de cadastro
├── dashbord.html       # Dashboard principal
├── Turmas.html         # Gerenciamento de turma e notas
├── EsqueciSenha.html   # Recuperação de senha
├── scripts/
│   ├── config.js       # Configuração da API e utilitários
│   ├── auth.js         # Autenticação (login/cadastro)
│   ├── storage.js      # Utilitários de storage
│   ├── dashboard.js    # Gerenciamento de instituições, cursos, disciplinas, turmas
│   └── turma.js        # Gerenciamento de componentes, alunos e notas
└── Static/
    └── styles/         # CSS
```

## 🔧 Funcionalidades Implementadas

### ✅ Autenticação
- Login com JWT
- Cadastro de usuário
- Logout
- Verificação automática de autenticação

### ✅ Dashboard
- Criar/Listar/Excluir Instituições
- Criar/Listar/Excluir Cursos
- Criar/Listar/Excluir Disciplinas (com sigla, código, período)
- Criar/Listar/Excluir Turmas
- Navegação entre telas

### ✅ Gerenciamento de Turma
- Criar Componentes de Nota
- Adicionar alunos manualmente
- Importar alunos via CSV
- Lançar notas por componente
- Visualizar nota final calculada
- Exportar notas em CSV

## 📝 Notas Importantes

1. **Token JWT**: Salvo automaticamente no localStorage
2. **CSV Import**: Apenas as 2 primeiras colunas são usadas (Matrícula, Nome)
3. **Exportação**: Só funciona quando todas as notas estão preenchidas
4. **Nota Final**: Calculada automaticamente baseada na fórmula da disciplina

## 🐛 Troubleshooting

### Erro de CORS
- Certifique-se de que o backend tem CORS habilitado
- Verifique se a URL da API está correta em `config.js`

### Token Expirado
- Faça login novamente
- O token expira em 2 horas

### Erro 401 (Unauthorized)
- Verifique se está logado
- Faça login novamente se necessário

