USE notadez;

-- Criar tabela cursos
CREATE TABLE IF NOT EXISTS cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomeCurso VARCHAR(255) NOT NULL,
    nomeInstituicao VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_cursos_instituicao ON cursos(nomeInstituicao);

-- Adicionar Foreign Key na tabela disciplinas
-- (Se der erro porque a FK já existe, pode ignorar)
ALTER TABLE disciplinas 
ADD CONSTRAINT fk_disciplinas_curso 
FOREIGN KEY (idCurso) REFERENCES cursos(id) ON DELETE CASCADE;

