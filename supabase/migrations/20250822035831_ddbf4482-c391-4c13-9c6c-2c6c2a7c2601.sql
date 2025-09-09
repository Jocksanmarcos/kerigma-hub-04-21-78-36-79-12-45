-- Adicionar colunas pai_id e mae_id na tabela pessoas
ALTER TABLE public.pessoas 
ADD COLUMN pai_id UUID REFERENCES public.pessoas(id),
ADD COLUMN mae_id UUID REFERENCES public.pessoas(id);

-- Criar índices para melhor performance
CREATE INDEX idx_pessoas_pai_id ON public.pessoas(pai_id);
CREATE INDEX idx_pessoas_mae_id ON public.pessoas(mae_id);

-- Migrar dados existentes dos vínculos familiares
UPDATE public.pessoas SET pai_id = (
  SELECT vf.pessoa_id 
  FROM public.vinculos_familiares vf 
  WHERE vf.pessoa_relacionada_id = pessoas.id 
  AND vf.tipo_vinculo = 'pai'
  LIMIT 1
);

UPDATE public.pessoas SET mae_id = (
  SELECT vf.pessoa_id 
  FROM public.vinculos_familiares vf 
  WHERE vf.pessoa_relacionada_id = pessoas.id 
  AND vf.tipo_vinculo = 'mae'
  LIMIT 1
);

-- Função para prevenir referências circulares
CREATE OR REPLACE FUNCTION public.check_parent_circular_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se pai não é descendente
  IF NEW.pai_id IS NOT NULL AND EXISTS (
    WITH RECURSIVE descendentes AS (
      SELECT id FROM pessoas WHERE id = NEW.id
      UNION ALL
      SELECT p.id FROM pessoas p 
      JOIN descendentes d ON (p.pai_id = d.id OR p.mae_id = d.id)
    )
    SELECT 1 FROM descendentes WHERE id = NEW.pai_id
  ) THEN
    RAISE EXCEPTION 'Referência circular detectada: pai não pode ser descendente';
  END IF;
  
  -- Verificar se mãe não é descendente
  IF NEW.mae_id IS NOT NULL AND EXISTS (
    WITH RECURSIVE descendentes AS (
      SELECT id FROM pessoas WHERE id = NEW.id
      UNION ALL
      SELECT p.id FROM pessoas p 
      JOIN descendentes d ON (p.pai_id = d.id OR p.mae_id = d.id)
    )
    SELECT 1 FROM descendentes WHERE id = NEW.mae_id
  ) THEN
    RAISE EXCEPTION 'Referência circular detectada: mãe não pode ser descendente';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para verificar referências circulares
CREATE TRIGGER check_parent_references 
  BEFORE INSERT OR UPDATE ON public.pessoas
  FOR EACH ROW EXECUTE FUNCTION public.check_parent_circular_reference();