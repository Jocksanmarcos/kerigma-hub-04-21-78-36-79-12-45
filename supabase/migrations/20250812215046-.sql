-- Criar política pública para SELECT em celulas (apenas ativas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'celulas' AND policyname = 'Public can view active cells'
  ) THEN
    CREATE POLICY "Public can view active cells"
    ON public.celulas
    FOR SELECT
    USING (ativa = true);
  END IF;
END$$;

-- Habilitar RLS em eventos (idempotente)
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Criar política pública para SELECT em eventos (somente eventos públicos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'eventos' AND policyname = 'Public can view public events'
  ) THEN
    CREATE POLICY "Public can view public events"
    ON public.eventos
    FOR SELECT
    USING (publico = true);
  END IF;
END$$;