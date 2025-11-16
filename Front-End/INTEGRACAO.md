# Integração Frontend-Backend

## Status da Integração ✅

O frontend está **totalmente conectado** ao backend através da API REST.

## Configuração

### Backend
- **URL Base**: `http://localhost:3000`
- **API Endpoint**: `http://localhost:3000/api`
- **Porta**: 3000
- **CORS**: Habilitado para todas as origens

### Frontend
- **Configuração**: `Front-End/scripts/config.js`
- **URL da API**: `http://localhost:3000/api`
- **Autenticação**: JWT Token armazenado no localStorage

## Páginas Conectadas

### ✅ index.html (Login)
- **Scripts**: `config.js`, `storage.js`, `auth.js`
- **Funcionalidade**: Login conectado ao endpoint `/api/auth/login`
- **Status**: ✅ Funcional

### ✅ cadastro.html (Cadastro)
- **Scripts**: `config.js`, `storage.js`, `auth.js`
- **Funcionalidade**: Cadastro conectado ao endpoint `/api/auth/register`
- **Status**: ✅ Funcional

### ✅ EsqueciSenha.html (Recuperação de Senha)
- **Scripts**: `config.js`, `storage.js`, `auth.js`
- **Funcionalidade**: Recuperação conectada ao endpoint `/api/auth/forgot-password`
- **Status**: ✅ Funcional

### ✅ dashbord.html (Dashboard)
- **Scripts**: `config.js`, `storage.js`, `auth.js`, `dashboard.js`
- **Funcionalidades**:
  - Listar/Criar Instituições: `/api/instituicoes`
  - Listar/Criar Cursos: `/api/cursos`
  - Listar/Criar Disciplinas: `/api/disciplinas`
  - Listar/Criar Turmas: `/api/turmas`
- **Status**: ✅ Funcional

### ✅ Turmas.html (Gerenciamento de Turmas)
- **Scripts**: `config.js`, `storage.js`, `auth.js`, `turma.js`
- **Funcionalidades**:
  - Componentes de Nota: `/api/componentes-nota`
  - Alunos: `/api/alunos`
  - Matrículas: `/api/matriculas`
  - Notas: `/api/notas-componente`
  - Exportar CSV: `/api/turmas/:id/exportar-notas`
- **Status**: ✅ Funcional

## Autenticação

### Fluxo de Autenticação
1. Usuário faz login em `index.html`
2. Backend retorna JWT token
3. Token é armazenado no `localStorage`
4. Todas as requisições subsequentes incluem o token no header `Authorization: Bearer <token>`
5. Middleware `authMiddleware` valida o token em rotas protegidas

### Rotas Protegidas
Todas as rotas exceto:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Funções Principais

### `apiRequest(endpoint, options)`
Função central para fazer requisições HTTP ao backend.
- Adiciona automaticamente o token JWT
- Trata erros de rede
- Faz logout automático em caso de 401 (não autorizado)

### `checkAuth()`
Verifica se o usuário está autenticado.
- Redireciona para login se não houver token

### `logout()`
Remove token e dados do usuário do localStorage.
- Redireciona para a página de login

## Como Testar

1. **Iniciar o Backend**:
   ```powershell
   cd backend
   npm run dev
   ```

2. **Abrir o Frontend**:
   - Abra `Front-End/index.html` no navegador
   - Ou use um servidor local (ex: Live Server no VS Code)

3. **Testar Login**:
   - Use um email e senha cadastrados
   - Deve redirecionar para `dashbord.html` após login bem-sucedido

4. **Verificar Console**:
   - Abra o DevTools (F12)
   - Verifique se há erros no console
   - Verifique as requisições na aba Network

## Troubleshooting

### Erro: "Erro de conexão com o servidor"
- Verifique se o backend está rodando na porta 3000
- Verifique se não há firewall bloqueando
- Verifique a URL no `config.js`

### Erro: "Access denied" ou 401
- Token expirado ou inválido
- Faça login novamente
- Verifique se o token está sendo enviado no header

### Erro: "CORS"
- Backend já tem CORS habilitado
- Se persistir, verifique a configuração do servidor

## Próximos Passos

- [ ] Adicionar refresh token para renovação automática
- [ ] Implementar tratamento de timeout
- [ ] Adicionar loading states nas requisições
- [ ] Implementar retry automático para requisições falhadas

