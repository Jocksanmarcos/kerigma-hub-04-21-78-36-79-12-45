-- Primeiro, vamos verificar e remover a constraint única problemática
-- Remover a constraint única da coluna pessoa_id para permitir múltiplos vínculos por pessoa
ALTER TABLE vinculos_familiares DROP CONSTRAINT IF EXISTS vinculos_familiares_pessoa_id_key;

-- Criar uma constraint única composta mais apropriada para evitar vínculos duplicados
-- Uma pessoa não pode ter o mesmo tipo de vínculo com a mesma pessoa relacionada
ALTER TABLE vinculos_familiares 
ADD CONSTRAINT vinculos_familiares_unique_relationship 
UNIQUE (pessoa_id, pessoa_relacionada_id, tipo_vinculo);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vinculos_pessoa_id ON vinculos_familiares(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_vinculos_pessoa_relacionada_id ON vinculos_familiares(pessoa_relacionada_id);
CREATE INDEX IF NOT EXISTS idx_vinculos_familia_pessoa ON vinculos_familiares(familia_id, pessoa_id);