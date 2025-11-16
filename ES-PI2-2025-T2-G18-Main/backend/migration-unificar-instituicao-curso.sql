-- Script de migração para unificar instituições e cursos na mesma tabela
-- Este script migra dados existentes da estrutura antiga para a nova

USE notadez;

-- Passo 1: Adicionar novas colunas na tabela cursos (se não existirem)
-- Se der erro "Duplicate column name", as colunas já existem e pode ignorar
ALTER TABLE cursos 
ADD COLUMN nomeCurso VARCHAR(255) AFTER id;

ALTER TABLE cursos 
ADD COLUMN nomeInstituicao VARCHAR(255) AFTER nomeCurso;

-- Passo 2: Migrar dados existentes (se houver dados nas tabelas antigas)
-- Copiar nome do curso para nomeCurso
UPDATE cursos SET nomeCurso = nome WHERE nomeCurso IS NULL;

-- Copiar nome da instituição para nomeInstituicao (usando JOIN com a tabela instituicoes)
-- Execute apenas se a tabela instituicoes ainda existir e tiver dados
UPDATE cursos c
INNER JOIN instituicoes i ON c.idInstituicao = i.id
SET c.nomeInstituicao = i.nome
WHERE c.nomeInstituicao IS NULL;

-- Passo 3: Remover colunas antigas (execute apenas após verificar que a migração funcionou)
-- ALTER TABLE cursos DROP COLUMN nome;
-- ALTER TABLE cursos DROP COLUMN idInstituicao;

-- Passo 4: Tornar as novas colunas obrigatórias (após garantir que todos os dados foram migrados)
-- ALTER TABLE cursos MODIFY COLUMN nomeCurso VARCHAR(255) NOT NULL;
-- ALTER TABLE cursos MODIFY COLUMN nomeInstituicao VARCHAR(255) NOT NULL;

-- Passo 5: Remover foreign key antiga (se ainda existir)
-- ALTER TABLE cursos DROP FOREIGN KEY cursos_ibfk_1;

-- Passo 6: Remover índice antigo e criar novo
-- DROP INDEX IF EXISTS idx_cursos_instituicao ON cursos;
-- CREATE INDEX idx_cursos_instituicao ON cursos(nomeInstituicao);

-- Passo 7: Remover tabela de instituições (execute apenas se tiver certeza que não precisa mais)
-- DROP TABLE IF EXISTS instituicoes;

