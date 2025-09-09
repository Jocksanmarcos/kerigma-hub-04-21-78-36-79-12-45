-- Fix RLS policies for biblia tables - use correct column names
DROP POLICY IF EXISTS "Versões da Bíblia são públicas" ON public.biblia_versoes;
CREATE POLICY "Versões da Bíblia são públicas" ON public.biblia_versoes FOR SELECT USING (ativa = true);

DROP POLICY IF EXISTS "Planos de leitura são públicos" ON public.planos_leitura_biblica;
CREATE POLICY "Planos de leitura são públicos" ON public.planos_leitura_biblica FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Medalhas são públicas" ON public.medalhas_biblia;
CREATE POLICY "Medalhas são públicas" ON public.medalhas_biblia FOR SELECT USING (ativa = true);