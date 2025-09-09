-- FASE 2: Configurar políticas de acesso público seguro

-- 1. Política para eventos públicos
-- A tabela eventos tem coluna 'publico' (boolean) baseado no schema
CREATE POLICY "Permitir leitura pública de eventos públicos" 
ON public.eventos 
FOR SELECT 
TO anon 
USING (publico = true);

-- 2. Política para cursos em destaque  
-- A tabela cursos tem coluna 'destaque' baseado no schema das edge functions
CREATE POLICY "Permitir leitura pública de cursos em destaque" 
ON public.cursos 
FOR SELECT 
TO anon 
USING (ativo = true AND COALESCE(destaque, false) = true);

-- 3. Política para células ativas
-- A tabela celulas tem coluna 'ativa' (boolean) baseado no schema
CREATE POLICY "Permitir leitura pública de células ativas" 
ON public.celulas 
FOR SELECT 
TO anon 
USING (ativa = true);