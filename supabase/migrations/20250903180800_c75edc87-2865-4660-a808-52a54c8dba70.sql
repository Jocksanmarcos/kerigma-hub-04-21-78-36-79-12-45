-- Primeiro, vamos criar um enum para os tipos de parentesco
CREATE TYPE IF NOT EXISTS tipo_parentesco AS ENUM (
  'pai',
  'mae', 
  'filho',
  'filha',
  'irmao',
  'irma',
  'avo',
  'ava',
  'neto',
  'neta',
  'tio',
  'tia',
  'sobrinho',
  'sobrinha',
  'primo',
  'prima',
  'genro',
  'nora',
  'sogro',
  'sogra',
  'cunhado',
  'cunhada',
  'padrasto',
  'madrasta',
  'enteado',
  'enteada',
  'responsavel',
  'membro',
  'outro'
);

-- Atualizar valores existentes para serem compatíveis com o enum
UPDATE vinculos_familiares 
SET tipo_vinculo = 'membro' 
WHERE tipo_vinculo NOT IN (
  'pai', 'mae', 'filho', 'filha', 'irmao', 'irma', 'avo', 'ava', 
  'neto', 'neta', 'tio', 'tia', 'sobrinho', 'sobrinha', 'primo', 'prima',
  'genro', 'nora', 'sogro', 'sogra', 'cunhado', 'cunhada', 
  'padrasto', 'madrasta', 'enteado', 'enteada', 'responsavel', 'membro', 'outro'
);

-- Remover o default temporariamente
ALTER TABLE vinculos_familiares 
ALTER COLUMN tipo_vinculo DROP DEFAULT;

-- Converter a coluna para usar o enum
ALTER TABLE vinculos_familiares 
ALTER COLUMN tipo_vinculo TYPE tipo_parentesco 
USING tipo_vinculo::tipo_parentesco;

-- Definir novo default
ALTER TABLE vinculos_familiares 
ALTER COLUMN tipo_vinculo SET DEFAULT 'membro'::tipo_parentesco;

-- Adicionar colunas para gerenciar parentescos
ALTER TABLE vinculos_familiares 
ADD COLUMN IF NOT EXISTS pessoa_relacionada_id UUID REFERENCES pessoas(id),
ADD COLUMN IF NOT EXISTS observacoes_parentesco TEXT,
ADD COLUMN IF NOT EXISTS confirmado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_confirmacao TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_vinculos_tipo_vinculo ON vinculos_familiares(tipo_vinculo);
CREATE INDEX IF NOT EXISTS idx_vinculos_pessoa_relacionada ON vinculos_familiares(pessoa_relacionada_id);