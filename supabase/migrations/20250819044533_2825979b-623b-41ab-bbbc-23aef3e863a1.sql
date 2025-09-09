-- Check current RLS policies for pessoas table
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'pessoas' AND schemaname = 'public';

-- Drop the existing restrictive policy and create a broader one for anonymous users
DROP POLICY IF EXISTS "public_can_create_biblioteca_visitors" ON public.pessoas;

-- Create a more permissive policy for anonymous users creating visitor records
CREATE POLICY "anonymous_can_create_visitors" 
ON public.pessoas 
FOR INSERT 
TO anon
WITH CHECK (
  tipo_pessoa = 'visitante'::text 
  AND user_id IS NULL 
  AND situacao = 'ativo'::text
);