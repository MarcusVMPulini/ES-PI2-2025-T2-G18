USE notadez;

-- ============================================
-- Criar tabela de alunos
-- ============================================
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ra VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Criar tabela de matrículas
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
-- Criar tabela de notas
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
-- Criar índices para melhorar performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_alunos_ra ON alunos(ra);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(idAluno);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(idTurma);
CREATE INDEX IF NOT EXISTS idx_notas_aluno ON notas(idAluno);
CREATE INDEX IF NOT EXISTS idx_notas_turma ON notas(idTurma);

-- ============================================
-- Verificação
-- ============================================
SELECT 'Tabelas criadas com sucesso!' AS status;

