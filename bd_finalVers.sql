CREATE DATABASE IF NOT EXISTS notadez;
USE notadez1;


CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS instituicoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomeCurso VARCHAR(255) NOT NULL,
    idInstituicao INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idInstituicao) REFERENCES instituicoes(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    idCurso INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idCurso) REFERENCES cursos(id) ON DELETE CASCADE
);


CREATE INDEX  idx_usuarios_email ON usuarios(email);
CREATE INDEX  idx_cursos_instituicao ON cursos(idInstituicao);
CREATE INDEX  idx_disciplinas_curso ON disciplinas(idCurso);

SELECT 'Banco de dados criado com sucesso!' AS status;
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'notadez' 
ORDER BY TABLE_NAME;


CREATE TABLE turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    idDisciplina INT NOT NULL,
    ano INT NOT NULL,
    semestre INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idDisciplina) REFERENCES disciplinas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ra VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


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


CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_cursos_instituicao ON cursos(idInstituicao);
CREATE INDEX idx_disciplinas_curso ON disciplinas(idCurso);
CREATE INDEX idx_turmas_disciplina ON turmas(idDisciplina);
CREATE INDEX idx_alunos_ra ON alunos(ra);
CREATE INDEX idx_matriculas_aluno ON matriculas(idAluno);
CREATE INDEX idx_matriculas_turma ON matriculas(idTurma);
CREATE INDEX idx_notas_aluno ON notas(idAluno);
CREATE INDEX idx_notas_turma ON notas(idTurma);


CREATE TABLE componentes_nota (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sigla VARCHAR(10) NOT NULL,
    descricao TEXT,
    idDisciplina INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idDisciplina) REFERENCES disciplinas(id) ON DELETE CASCADE
);


CREATE TABLE notas_componentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idAluno INT NOT NULL,
    idTurma INT NOT NULL,
    idComponente INT NOT NULL,
    valor DECIMAL(4,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idAluno) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (idTurma) REFERENCES turmas(id) ON DELETE CASCADE,
    FOREIGN KEY (idComponente) REFERENCES componentes_nota(id) ON DELETE CASCADE,
    UNIQUE KEY unique_nota_componente (idAluno, idTurma, idComponente)
);


ALTER TABLE disciplinas 
ADD COLUMN formula_nota_final VARCHAR(255) NULL;

CREATE TABLE auditoria_notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idNota INT NOT NULL,
    idAluno INT NOT NULL,
    valor_anterior DECIMAL(4,2),
    valor_novo DECIMAL(4,2),
    componente VARCHAR(10),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idNota) REFERENCES notas_componentes(id) ON DELETE CASCADE
);


ALTER TABLE disciplinas 
ADD COLUMN sigla VARCHAR(10) NULL,
ADD COLUMN codigo VARCHAR(20) NULL,
ADD COLUMN periodo VARCHAR(50) NULL;

ALTER TABLE turmas 
ADD COLUMN codigo VARCHAR(20) NULL,
ADD COLUMN apelido VARCHAR(100) NULL;
CREATE TABLE auditoria_notas_simples (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idNota INT NOT NULL,
    idAluno INT NOT NULL,
    campo VARCHAR(50) NOT NULL,
    valor_anterior VARCHAR(50),
    valor_novo VARCHAR(50),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idNota) REFERENCES notas(id) ON DELETE CASCADE
);


DELIMITER $$

CREATE TRIGGER trg_notas_update
AFTER UPDATE ON notas
FOR EACH ROW
BEGIN
    -- nota1 alterada
    IF OLD.nota1 <> NEW.nota1 THEN
        INSERT INTO auditoria_notas_simples (idNota, idAluno, campo, valor_anterior, valor_novo)
        VALUES (NEW.id, NEW.idAluno, 'nota1', OLD.nota1, NEW.nota1);
    END IF;

    -- nota2 alterada
    IF OLD.nota2 <> NEW.nota2 THEN
        INSERT INTO auditoria_notas_simples (idNota, idAluno, campo, valor_anterior, valor_novo)
        VALUES (NEW.id, NEW.idAluno, 'nota2', OLD.nota2, NEW.nota2);
    END IF;

    -- media alterada
    IF OLD.media <> NEW.media THEN
        INSERT INTO auditoria_notas_simples (idNota, idAluno, campo, valor_anterior, valor_novo)
        VALUES (NEW.id, NEW.idAluno, 'media', OLD.media, NEW.media);
    END IF;

    -- situacao alterada
    IF OLD.situacao <> NEW.situacao THEN
        INSERT INTO auditoria_notas_simples (idNota, idAluno, campo, valor_anterior, valor_novo)
        VALUES (NEW.id, NEW.idAluno, 'situacao', OLD.situacao, NEW.situacao);
    END IF;

END $$
DELIMITER ;