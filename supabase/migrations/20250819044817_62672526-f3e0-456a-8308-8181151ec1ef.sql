-- Let's check all current policies on pessoas table
SELECT * FROM pg_policies WHERE tablename = 'pessoas' AND schemaname = 'public';

-- Also check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'pessoas' AND schemaname = 'public';

-- Drop all INSERT policies and create a single comprehensive one
DROP POLICY IF EXISTS "anonymous_can_create_visitors" ON public.pessoas;
DROP POLICY IF EXISTS "authenticated_users_can_create_pessoas" ON public.pessoas;

-- Create a comprehensive INSERT policy that works for both authenticated and anonymous users
CREATE POLICY "users_can_create_pessoas" 
ON public.pessoas 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.role() = 'anon' THEN 
      (tipo_pessoa = 'visitante' AND user_id IS NULL AND situacao = 'ativo')
    WHEN auth.role() = 'authenticated' THEN 
      true
    ELSE false
  END
);