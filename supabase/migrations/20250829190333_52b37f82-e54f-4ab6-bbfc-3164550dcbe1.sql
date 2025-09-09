-- Políticas para permitir consulta pública nas tabelas bíblicas

-- Política para biblia_versoes
CREATE POLICY "Qualquer um pode ver versões da Bíblia" ON public.biblia_versoes
    FOR SELECT USING (true);

-- Política para biblia_livros  
CREATE POLICY "Qualquer um pode ver livros da Bíblia" ON public.biblia_livros
    FOR SELECT USING (true);

-- Política para biblia_versiculos
CREATE POLICY "Qualquer um pode ver versículos da Bíblia" ON public.biblia_versiculos
    FOR SELECT USING (true);

-- Habilitar RLS nas tabelas se ainda não estiver habilitado
ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;