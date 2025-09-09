-- Primeiro, vamos ver exatamente quais políticas existem
SELECT policyname, cmd, roles, with_check FROM pg_policies 
WHERE tablename = 'pessoas' AND schemaname = 'public';

-- Limpar todas as políticas de INSERT e criar uma nova simples e efetiva
DROP POLICY IF EXISTS "users_can_create_pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "authenticated_users_can_create_pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "anonymous_can_create_visitors" ON public.pessoas;
DROP POLICY IF EXISTS "public_can_create_biblioteca_visitors" ON public.pessoas;

-- Criar uma política simples que definitivamente funcionará para visitantes anônimos
CREATE POLICY "allow_visitor_creation" 
ON public.pessoas 
FOR INSERT 
WITH CHECK (
  -- Para usuários anônimos criando visitantes
  (auth.role() = 'anon' AND tipo_pessoa = 'visitante' AND user_id IS NULL AND situacao = 'ativo')
  OR
  -- Para usuários autenticados criando qualquer registro  
  (auth.role() = 'authenticated')
);

-- Verificar se a política foi criada corretamente
SELECT policyname, cmd, roles, with_check FROM pg_policies 
WHERE tablename = 'pessoas' AND schemaname = 'public' AND cmd = 'INSERT';