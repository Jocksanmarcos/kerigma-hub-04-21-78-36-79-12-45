-- Adicionar campo para tipo de responsabilidade familiar
ALTER TABLE pessoas 
ADD COLUMN tipo_responsabilidade_familiar text;

-- Criar enum para os tipos de responsabilidade
CREATE TYPE tipo_responsabilidade_enum AS ENUM (
  'pai_biologico',
  'mae_biologica', 
  'pai_adotivo',
  'mae_adotiva',
  'responsavel_legal',
  'tutor',
  'avo',
  'ava',
  'tio',
  'tia',
  'outro_parente',
  'responsavel'
);

-- Atualizar a coluna para usar o enum
ALTER TABLE pessoas 
ALTER COLUMN tipo_responsabilidade_familiar TYPE tipo_responsabilidade_enum 
USING tipo_responsabilidade_familiar::tipo_responsabilidade_enum;

-- Adicionar comentário explicativo
COMMENT ON COLUMN pessoas.tipo_responsabilidade_familiar IS 'Define o tipo de responsabilidade familiar da pessoa, permitindo diferentes estruturas familiares';

-- Criar índice para consultas mais eficientes
CREATE INDEX idx_pessoas_tipo_responsabilidade ON pessoas(tipo_responsabilidade_familiar);

-- Adicionar campo para indicar se é o responsável principal da família
ALTER TABLE pessoas 
ADD COLUMN responsavel_principal_familia boolean DEFAULT false;

COMMENT ON COLUMN pessoas.responsavel_principal_familia IS 'Indica se esta pessoa é o responsável principal pela família (para contatos, decisões, etc.)';

-- Criar índice para responsáveis principais
CREATE INDEX idx_pessoas_responsavel_principal ON pessoas(familia_id, responsavel_principal_familia) 
WHERE responsavel_principal_familia = true;