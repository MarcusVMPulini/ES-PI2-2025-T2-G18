USE notadez;

-- ============================================
-- Criar tabela de turmas
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
-- Criar índice para melhorar performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_turmas_disciplina ON turmas(idDisciplina);

-- ============================================
-- Verificação
-- ============================================
SELECT 'Tabela turmas criada com sucesso!' AS status;

