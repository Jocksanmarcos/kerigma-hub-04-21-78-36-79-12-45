-- Create function to get weekly birthdays
CREATE OR REPLACE FUNCTION public.get_aniversariantes_da_semana()
RETURNS TABLE(id UUID, nome_completo TEXT, data_nascimento DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.nome_completo, p.data_nascimento
  FROM public.pessoas p
  WHERE p.data_nascimento IS NOT NULL
    AND p.situacao = 'ativo'
    AND EXTRACT(WEEK FROM p.data_nascimento) = EXTRACT(WEEK FROM NOW())
    AND EXTRACT(YEAR FROM p.data_nascimento) != EXTRACT(YEAR FROM NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;