-- Corrigir políticas RLS para a migração recente
-- Atualizar política para páginas (usar novo nome da tabela)
DROP POLICY IF EXISTS "Leitura pública para páginas publicadas" ON public.paginas_site;
CREATE POLICY "Leitura pública para páginas publicadas" 
ON public.paginas_site FOR SELECT USING (status = 'publicado');

-- Corrigir função update_updated_at_column com search_path
DROP FUNCTION IF EXISTS update_updated_at_column();
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$;