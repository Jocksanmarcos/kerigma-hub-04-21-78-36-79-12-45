-- Permitir leitura pública de células ativas
CREATE POLICY IF NOT EXISTS "Public can view active cells"
ON public.celulas
FOR SELECT
USING (ativa = true);

-- Garantir que RLS esteja habilitado em eventos
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de eventos marcados como públicos
CREATE POLICY IF NOT EXISTS "Public can view public events"
ON public.eventos
FOR SELECT
USING (publico = true);
