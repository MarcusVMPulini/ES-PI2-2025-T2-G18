-- Script de migração para adicionar campos nome e telefone
-- e renomear password para senha na tabela usuarios

USE notadez;

-- Verificar e adicionar coluna nome (execute apenas se não existir)
-- Se der erro "Duplicate column name", a coluna já existe e pode ignorar
ALTER TABLE usuarios 
ADD COLUMN nome VARCHAR(255) AFTER id;

-- Verificar e adicionar coluna telefone (execute apenas se não existir)
-- Se der erro "Duplicate column name", a coluna já existe e pode ignorar
ALTER TABLE usuarios 
ADD COLUMN telefone VARCHAR(20) AFTER senha;

-- Se a tabela ainda tem a coluna 'password' e não tem 'senha', renomeie:
-- ALTER TABLE usuarios CHANGE COLUMN password senha VARCHAR(255) NOT NULL;

-- Se a tabela já tem dados e nome está NULL, você precisará atualizar:
-- UPDATE usuarios SET nome = 'Nome Padrão' WHERE nome IS NULL;

-- Depois de atualizar os dados, torne nome obrigatório:
-- ALTER TABLE usuarios MODIFY COLUMN nome VARCHAR(255) NOT NULL;

