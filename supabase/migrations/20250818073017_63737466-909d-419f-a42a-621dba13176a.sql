-- Adicionar campos de escolaridade e estado civil à tabela pessoas
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS escolaridade TEXT,
ADD COLUMN IF NOT EXISTS estado_civil TEXT;

-- Comentários para documentar os campos
COMMENT ON COLUMN public.pessoas.escolaridade IS 'Nível de escolaridade da pessoa (ensino_fundamental, ensino_medio, ensino_superior, pos_graduacao, etc.)';
COMMENT ON COLUMN public.pessoas.estado_civil IS 'Estado civil da pessoa (solteiro, casado, divorciado, viuvo, uniao_estavel)';