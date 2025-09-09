-- Allow public creation of person records for library reservations
CREATE POLICY "public_can_create_biblioteca_visitors" 
ON public.pessoas 
FOR INSERT 
WITH CHECK (
  tipo_pessoa = 'visitante' AND 
  user_id IS NULL AND 
  situacao = 'ativo'
);