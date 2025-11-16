# NotaDez - Sistema de Gestão de Notas

Sistema web para gerenciamento de notas acadêmicas desenvolvido como Projeto Integrador da PUC-Campinas.

## 📋 Sobre o Projeto

O NotaDez é uma aplicação web que permite aos docentes gerenciar as notas de seus estudantes de forma organizada e eficiente. O sistema oferece funcionalidades completas para cadastro de instituições, cursos, disciplinas, turmas, alunos e lançamento de notas com componentes configuráveis.

## 🚀 Tecnologias

- **Node.js** com **TypeScript**
- **Express.js** - Framework web
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas

## 📦 Instalação

### Pré-requisitos

- Node.js (v16 ou superior)
- MySQL (v8.0 ou superior)
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd backend-oracle/backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**

Crie o banco de dados MySQL:
```sql
CREATE DATABASE notadez;
```

Execute as migrations necessárias para criar as tabelas (consulte a documentação do banco de dados).

4. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto `backend/`:

```env
# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=notadez

# JWT Secret (para autenticação)
JWT_SECRET=segredo_super_secreto_aqui
```

5. **Execute o projeto**

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🗄️ Estrutura do Banco de Dados

O banco de dados possui as seguintes tabelas:

- `usuarios` - Usuários do sistema (professores)
- `instituicoes` - Instituições de ensino
- `cursos` - Cursos das instituições
- `disciplinas` - Disciplinas dos cursos (com sigla, código, período e fórmula de nota final)
- `turmas` - Turmas das disciplinas (com ano, semestre, código e apelido)
- `alunos` - Alunos do sistema
- `matriculas` - Relacionamento aluno-turma
- `componentes_nota` - Componentes de nota (P1, P2, P3, etc.)
- `notas_componentes` - Notas dos alunos por componente
- `auditoria_notas` - Log de alterações de notas (via trigger)

## 📡 API Endpoints

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login (retorna JWT token)

**Headers necessários para rotas protegidas:**
```
Authorization: Bearer {token_jwt}
```

### Instituições

- `GET /api/instituicoes` - Listar todas as instituições
- `GET /api/instituicoes/:id` - Buscar instituição por ID
- `POST /api/instituicoes` - Criar nova instituição
- `PUT /api/instituicoes/:id` - Editar instituição
- `DELETE /api/instituicoes/:id` - Excluir instituição
- `GET /api/instituicoes/:idInstituicao/cursos` - Listar cursos de uma instituição

### Cursos

- `GET /api/cursos` - Listar todos os cursos
- `POST /api/cursos` - Criar novo curso
- `PUT /api/cursos/:id` - Editar curso
- `DELETE /api/cursos/:id` - Excluir curso

### Disciplinas

- `GET /api/disciplinas` - Listar todas as disciplinas
- `POST /api/disciplinas` - Criar nova disciplina
- `PUT /api/disciplinas/:id` - Editar disciplina
- `DELETE /api/disciplinas/:id` - Excluir disciplina
- `PUT /api/disciplinas/:id/formula` - Definir fórmula de nota final

**Campos da disciplina:**
- `nome` (obrigatório)
- `idCurso` (obrigatório)
- `sigla` (opcional)
- `codigo` (opcional)
- `periodo` (opcional)
- `formula_nota_final` (opcional) - Ex: `(P1 + P2 + P3) / 3`

### Turmas

- `GET /api/turmas` - Listar todas as turmas
- `POST /api/turmas` - Criar nova turma
- `PUT /api/turmas/:id` - Editar turma
- `DELETE /api/turmas/:id` - Excluir turma
- `POST /api/turmas/:idTurma/importar-alunos` - Importar alunos via CSV
- `GET /api/turmas/:idTurma/exportar-notas` - Exportar notas em CSV

**Campos da turma:**
- `nome` (obrigatório)
- `idDisciplina` (obrigatório)
- `ano` (obrigatório)
- `semestre` (obrigatório)
- `codigo` (opcional)
- `apelido` (opcional)

### Alunos

- `GET /api/alunos` - Listar todos os alunos
- `POST /api/alunos` - Criar novo aluno
- `PUT /api/alunos/:id` - Editar aluno
- `DELETE /api/alunos/:id` - Excluir aluno

### Matrículas

- `GET /api/matriculas` - Listar todas as matrículas
- `POST /api/matriculas` - Matricular aluno em turma
- `DELETE /api/matriculas/:idAluno/:idTurma` - Remover matrícula

### Componentes de Nota

- `GET /api/componentes-nota/disciplina/:idDisciplina` - Listar componentes de uma disciplina
- `POST /api/componentes-nota/disciplina/:idDisciplina` - Criar componente
- `PUT /api/componentes-nota/:id` - Editar componente
- `DELETE /api/componentes-nota/:id` - Excluir componente

**Campos do componente:**
- `nome` (obrigatório) - Ex: "Prova 1"
- `sigla` (obrigatório) - Ex: "P1" (deve ser única por disciplina)
- `descricao` (opcional)

### Notas por Componente

- `GET /api/notas-componente/turma/:idTurma` - Listar todas as notas de uma turma
- `GET /api/notas-componente/turma/:idTurma/componente/:idComponente` - Listar notas de um componente específico
- `POST /api/notas-componente/turma/:idTurma/componente/:idComponente` - Lançar/editar nota de um componente
- `GET /api/notas-componente/turma/:idTurma/aluno/:idAluno/nota-final` - Calcular nota final de um aluno
- `PUT /api/notas-componente/:id` - Editar nota específica
- `DELETE /api/notas-componente/:id` - Excluir nota

### Boletim

- `GET /api/boletim/:idAluno` - Gerar boletim por aluno

### Notas (Legado)

- `GET /api/notas` - Listar todas as notas (sistema antigo)
- `POST /api/notas` - Lançar nota (sistema antigo)
- `PUT /api/notas/:id` - Editar nota (sistema antigo)
- `DELETE /api/notas/:id` - Excluir nota (sistema antigo)

## 🔐 Autenticação

Todas as rotas (exceto `/api/auth/*`) requerem autenticação via JWT token.

**Como usar:**
1. Faça login em `/api/auth/login`
2. Copie o token retornado
3. Adicione no header: `Authorization: Bearer {token}`

O token expira em 2 horas.

## 📝 Exemplos de Uso

### Criar Disciplina com Componentes

```json
POST /api/disciplinas
{
  "nome": "Projeto Integrador II",
  "idCurso": 1,
  "sigla": "PI2",
  "codigo": "ES-PI2",
  "periodo": "2 semestre"
}

PUT /api/disciplinas/1/formula
{
  "formula_nota_final": "(P1 + P2 + P3) / 3"
}
```

### Criar Componentes de Nota

```json
POST /api/componentes-nota/disciplina/1
{
  "nome": "Prova 1",
  "sigla": "P1",
  "descricao": "Prova teórica sobre conteúdo do primeiro módulo"
}
```

### Importar Alunos

```json
POST /api/turmas/1/importar-alunos
{
  "alunos": [
    { "ra": "11111", "nome": "João Silva" },
    { "ra": "11112", "nome": "Maria Santos" }
  ]
}
```

### Lançar Nota

```json
POST /api/notas-componente/turma/1/componente/1
{
  "idAluno": 1,
  "valor": 8.5
}
```

## 🏗️ Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (banco de dados)
│   ├── controllers/     # Controladores (lógica de requisições)
│   ├── services/        # Serviços (lógica de negócio)
│   ├── routes/          # Rotas da API
│   ├── middleware/      # Middlewares (autenticação)
│   ├── db/              # Dados mock (se houver)
│   └── server.ts        # Arquivo principal
├── package.json
├── tsconfig.json
└── .env                 # Variáveis de ambiente (criar)
```

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação via JWT
- Validação de dados de entrada
- Proteção contra SQL injection (usando prepared statements)

## 📋 Validações

- **Notas:** Valores entre 0.00 e 10.00
- **RA:** Deve ser único
- **Sigla de componente:** Deve ser única por disciplina
- **Fórmula de nota final:** Deve incluir todos os componentes cadastrados
- **Exclusões:** Validação de dependências antes de excluir

## 🚨 Importante

- A exclusão de turma é **irrevogável** (conforme escopo)
- Alunos já matriculados não são sobrescritos na importação CSV
- Todas as notas devem estar preenchidas para exportar CSV
- A auditoria de notas é feita via trigger no banco de dados

## 📄 Licença

Este projeto foi desenvolvido como parte do Projeto Integrador da PUC-Campinas.

## 👥 Equipe

ES-PI2-2025-T2-G18

---

**Desenvolvido com ❤️ para facilitar a gestão acadêmica**
