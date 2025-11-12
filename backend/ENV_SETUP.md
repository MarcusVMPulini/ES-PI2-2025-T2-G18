# Configuração de Variáveis de Ambiente

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

## Descrição das Variáveis

- **DB_HOST**: Endereço do servidor MySQL (padrão: localhost)
- **DB_PORT**: Porta do MySQL (padrão: 3306)
- **DB_USER**: Usuário do MySQL (padrão: root)
- **DB_PASSWORD**: Senha do MySQL
- **DB_NAME**: Nome do banco de dados (padrão: notadez)
- **JWT_SECRET**: Chave secreta para assinatura dos tokens JWT

## Importante

⚠️ **Nunca commite o arquivo `.env` no repositório!** Ele contém informações sensíveis como senhas e chaves secretas.

