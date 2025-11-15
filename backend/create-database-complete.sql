-- ============================================
-- Script SQL Completo - Banco de Dados NotaDez
-- Cria todas as tabelas e Foreign Keys do zero
-- ============================================

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS notadez;
USE notadez;

-- ============================================
-- TABELA 1: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA 2: instituicoes
-- ============================================
CREATE TABLE IF NOT EXISTS instituicoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA 3: cursos
-- ============================================
CREATE TABLE IF NOT EXISTS cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomeCurso VARCHAR(255) NOT NULL,
    idInstituicao INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idInstituicao) REFERENCES instituicoes(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA 4: disciplinas
-- ============================================
CREATE TABLE IF NOT EXISTS disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    idCurso INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idCurso) REFERENCES cursos(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA 5: turmas
-- ============================================
CREATE TABLE IF NOT EXISTS turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    idDisciplina INT NOT NULL,
    ano INT NOT NULL,
    semestre INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idDisciplina) REFERENCES disciplinas(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA 6: alunos
-- ============================================
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ra VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA 7: matriculas
-- ============================================
CREATE TABLE IF NOT EXISTS matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idAluno INT NOT NULL,
    idTurma INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idAluno) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (idTurma) REFERENCES turmas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_matricula (idAluno, idTurma)
);

-- ============================================
-- TABELA 8: notas
-- ============================================
CREATE TABLE IF NOT EXISTS notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idAluno INT NOT NULL,
    idTurma INT NOT NULL,
    nota1 DECIMAL(4,2) NOT NULL,
    nota2 DECIMAL(4,2) NOT NULL,
    media DECIMAL(4,2) NOT NULL,
    situacao VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idAluno) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (idTurma) REFERENCES turmas(id) ON DELETE CASCADE
);

-- ============================================
-- ÍNDICES para melhorar performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_cursos_instituicao ON cursos(idInstituicao);
CREATE INDEX IF NOT EXISTS idx_disciplinas_curso ON disciplinas(idCurso);
CREATE INDEX IF NOT EXISTS idx_turmas_disciplina ON turmas(idDisciplina);
CREATE INDEX IF NOT EXISTS idx_alunos_ra ON alunos(ra);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(idAluno);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(idTurma);
CREATE INDEX IF NOT EXISTS idx_notas_aluno ON notas(idAluno);
CREATE INDEX IF NOT EXISTS idx_notas_turma ON notas(idTurma);

-- ============================================
-- Verificação: Mostrar todas as tabelas criadas
-- ============================================
SELECT 'Banco de dados criado com sucesso!' AS status;
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'notadez' 
ORDER BY TABLE_NAME;

