-- Update RLS policy for biblioteca visitor creation to allow public reservation requests
DROP POLICY IF EXISTS "public_can_create_biblioteca_visitors" ON public.pessoas;

CREATE POLICY "public_can_create_biblioteca_visitors" 
ON public.pessoas 
FOR INSERT 
WITH CHECK (
  tipo_pessoa = 'visitante'::text 
  AND user_id IS NULL 
  AND situacao = 'ativo'::text
  AND nome_completo IS NOT NULL
  AND email IS NOT NULL
);