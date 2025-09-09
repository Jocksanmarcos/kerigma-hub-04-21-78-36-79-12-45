-- Primeiro, vamos criar um enum para os tipos de parentesco
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

-- Atualizar a tabela vinculos_familiares para usar o enum
ALTER TABLE vinculos_familiares 
ALTER COLUMN tipo_vinculo TYPE tipo_parentesco 
USING tipo_vinculo::tipo_parentesco;

-- Adicionar uma coluna para especificar parentesco recíproco se necessário
ALTER TABLE vinculos_familiares 
ADD COLUMN IF NOT EXISTS observacoes_parentesco TEXT,
ADD COLUMN IF NOT EXISTS confirmado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_confirmacao TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_vinculos_tipo_vinculo ON vinculos_familiares(tipo_vinculo);

-- Função para criar vínculos recíprocos automaticamente
CREATE OR REPLACE FUNCTION criar_vinculo_reciproco()
RETURNS TRIGGER AS $$
DECLARE
  tipo_reciproco tipo_parentesco;
BEGIN
  -- Determinar o tipo recíproco baseado no parentesco
  CASE NEW.tipo_vinculo
    WHEN 'pai' THEN tipo_reciproco := 'filho';
    WHEN 'mae' THEN tipo_reciproco := 'filho';
    WHEN 'filho' THEN 
      -- Precisaríamos saber o gênero do pai/mãe, por simplicidade vamos usar 'pai'
      tipo_reciproco := 'pai';
    WHEN 'filha' THEN 
      tipo_reciproco := 'pai';
    WHEN 'irmao' THEN tipo_reciproco := 'irmao';
    WHEN 'irma' THEN tipo_reciproco := 'irma';
    WHEN 'avo' THEN tipo_reciproco := 'neto';
    WHEN 'ava' THEN tipo_reciproco := 'neto';
    WHEN 'neto' THEN tipo_reciproco := 'avo';
    WHEN 'neta' THEN tipo_reciproco := 'ava';
    WHEN 'tio' THEN tipo_reciproco := 'sobrinho';
    WHEN 'tia' THEN tipo_reciproco := 'sobrinho';
    WHEN 'sobrinho' THEN tipo_reciproco := 'tio';
    WHEN 'sobrinha' THEN tipo_reciproco := 'tia';
    WHEN 'primo' THEN tipo_reciproco := 'primo';
    WHEN 'prima' THEN tipo_reciproco := 'prima';
    WHEN 'genro' THEN tipo_reciproco := 'sogro';
    WHEN 'nora' THEN tipo_reciproco := 'sogro';
    WHEN 'sogro' THEN tipo_reciproco := 'genro';
    WHEN 'sogra' THEN tipo_reciproco := 'nora';
    WHEN 'cunhado' THEN tipo_reciproco := 'cunhado';
    WHEN 'cunhada' THEN tipo_reciproco := 'cunhada';
    ELSE tipo_reciproco := 'outro';
  END CASE;
  
  -- Inserir vínculo recíproco se não existir
  INSERT INTO vinculos_familiares (
    familia_id, 
    pessoa_id, 
    pessoa_relacionada_id, 
    tipo_vinculo,
    observacoes_parentesco
  )
  SELECT 
    NEW.familia_id,
    NEW.pessoa_relacionada_id,
    NEW.pessoa_id,
    tipo_reciproco,
    'Vínculo recíproco criado automaticamente'
  WHERE NOT EXISTS (
    SELECT 1 FROM vinculos_familiares 
    WHERE pessoa_id = NEW.pessoa_relacionada_id 
    AND pessoa_relacionada_id = NEW.pessoa_id
  ) AND NEW.pessoa_relacionada_id IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar coluna pessoa_relacionada_id se não existir
ALTER TABLE vinculos_familiares 
ADD COLUMN IF NOT EXISTS pessoa_relacionada_id UUID REFERENCES pessoas(id);

-- Criar trigger para vínculos recíprocos
CREATE TRIGGER trigger_vinculo_reciproco
  AFTER INSERT ON vinculos_familiares
  FOR EACH ROW
  WHEN (NEW.pessoa_relacionada_id IS NOT NULL)
  EXECUTE FUNCTION criar_vinculo_reciproco();