-- Verificar se a tabela biblioteca_livros tem RLS habilitado
-- E criar políticas adequadas para permitir inserção

-- Primeiro vamos habilitar RLS na tabela
ALTER TABLE public.biblioteca_livros ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam todos os livros
CREATE POLICY "Usuários podem ver todos os livros" 
ON public.biblioteca_livros 
FOR SELECT 
USING (true);

-- Política para permitir que usuários autenticados criem livros
-- (assumindo que qualquer usuário logado pode cadastrar livros)
CREATE POLICY "Usuários autenticados podem criar livros" 
ON public.biblioteca_livros 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir que usuários autenticados atualizem livros
CREATE POLICY "Usuários autenticados podem atualizar livros" 
ON public.biblioteca_livros 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Política para permitir que administradores deletem livros
CREATE POLICY "Administradores podem deletar livros" 
ON public.biblioteca_livros 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true
  )
);