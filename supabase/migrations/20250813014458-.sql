-- FASE 2: Configurar políticas de acesso público seguro (corrigido)

-- 1. Política para eventos públicos
CREATE POLICY "Permitir leitura pública de eventos públicos" 
ON public.eventos 
FOR SELECT 
TO anon 
USING (publico = true);

-- 2. Política para cursos ativos (sem coluna destaque)
-- Baseado no esquema, apenas cursos ativos serão públicos
CREATE POLICY "Permitir leitura pública de cursos ativos" 
ON public.cursos 
FOR SELECT 
TO anon 
USING (ativo = true);

-- 3. Política para células ativas
CREATE POLICY "Permitir leitura pública de células ativas" 
ON public.celulas 
FOR SELECT 
TO anon 
USING (ativa = true);