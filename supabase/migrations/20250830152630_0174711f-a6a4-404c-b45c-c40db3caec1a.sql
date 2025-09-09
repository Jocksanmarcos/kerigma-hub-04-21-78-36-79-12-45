-- Adicionar políticas RLS para as tabelas da Bíblia
-- Estas tabelas são de conteúdo público, então permitem leitura para todos

-- Políticas para biblia_versoes
CREATE POLICY "Versões da Bíblia são públicas" 
ON biblia_versoes 
FOR SELECT 
USING (true);

-- Políticas para biblia_livros  
CREATE POLICY "Livros da Bíblia são públicos" 
ON biblia_livros 
FOR SELECT 
USING (true);

-- Políticas para biblia_versiculos
CREATE POLICY "Versículos da Bíblia são públicos" 
ON biblia_versiculos 
FOR SELECT 
USING (true);