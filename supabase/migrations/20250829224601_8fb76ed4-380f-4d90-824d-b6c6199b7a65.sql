-- Habilitar RLS na tabela cursos se ainda não estiver habilitado
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

-- Criar política para administradores verem todos os cursos
CREATE POLICY "Administradores podem ver todos os cursos"
ON public.cursos
FOR SELECT
USING ((SELECT "user_metadata"->>'role' FROM auth.users WHERE id = auth.uid()) = 'administrador');