-- Script para adicionar coluna peso na tabela componentes_nota
-- Execute este script no banco de dados MySQL
-- IMPORTANTE: Certifique-se de estar usando o banco de dados correto antes de executar

-- Opção 1: Se estiver usando o banco 'notadez1'
-- USE notadez1;

-- Opção 2: Se estiver usando outro banco, ajuste o nome acima ou execute diretamente:

-- Adicionar coluna peso (execute apenas se a coluna não existir)
-- Se der erro de coluna já existe, ignore o erro
ALTER TABLE componentes_nota 
ADD COLUMN peso DECIMAL(5,2) NULL 
COMMENT "Percentual que o componente vale na nota final (0-100)";

-- Verificar se foi adicionada (ajuste o nome do banco se necessário)
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND TABLE_NAME = 'componentes_nota'
-- AND COLUMN_NAME = 'peso';
