# ES-PI2-2025-T2-G18
Projeto integrador da PUC segundo semestre

## Configuração do Banco de Dados MySQL

### 1. Instalar MySQL
Certifique-se de ter o MySQL instalado e rodando em sua máquina.

### 2. Criar o Banco de Dados
Execute o script SQL fornecido para criar as tabelas:

```bash
mysql -u root -p < mysql-schema.sql
```

Ou execute manualmente no MySQL:
```sql
source mysql-schema.sql
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=notadez

# JWT Secret (para autenticação)
JWT_SECRET=segredo_super_secreto
```

### 4. Instalar Dependências
```bash
npm install
```

### 5. Executar o Projeto
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm start
```

## Estrutura do Banco de Dados

O banco de dados possui as seguintes tabelas:
- `users` - Usuários do sistema
- `instituicoes` - Instituições de ensino
- `cursos` - Cursos das instituições
- `disciplinas` - Disciplinas dos cursos

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login

### Instituições
- `GET /api/instituicoes` - Listar todas as instituições
- `POST /api/instituicoes` - Criar nova instituição
- `PUT /api/instituicoes/:id` - Editar instituição
- `DELETE /api/instituicoes/:id` - Excluir instituição

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