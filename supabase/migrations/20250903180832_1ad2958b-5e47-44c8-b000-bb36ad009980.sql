-- Criar enum para os tipos de parentesco (verificando se já existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_parentesco') THEN
        CREATE TYPE tipo_parentesco AS ENUM (
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
    END IF;
END $$;

-- Adicionar colunas para gerenciar parentescos primeiro
ALTER TABLE vinculos_familiares 
ADD COLUMN IF NOT EXISTS pessoa_relacionada_id UUID REFERENCES pessoas(id),
ADD COLUMN IF NOT EXISTS observacoes_parentesco TEXT,
ADD COLUMN IF NOT EXISTS confirmado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_confirmacao TIMESTAMP WITH TIME ZONE;

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