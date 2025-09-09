-- Create database functions for optimized ranking queries

-- Function 1: Get ranking for a specific cell
CREATE OR REPLACE FUNCTION public.get_ranking_celula(id_da_celula UUID)
RETURNS TABLE (
  pessoa_id UUID,
  pontos_total BIGINT, 
  nome_completo TEXT, 
  foto_url TEXT,
  posicao INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as pessoa_id,
    COALESCE(SUM(qr.pontos_ganhos), 0)::BIGINT as pontos_total,
    p.nome_completo,
    p.foto_url,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(qr.pontos_ganhos), 0) DESC)::INTEGER as posicao
  FROM public.pessoas p
  LEFT JOIN public.quiz_resultados qr ON p.id::text = qr.pessoa_id
  WHERE p.celula_id = id_da_celula
    AND p.situacao = 'ativo'
  GROUP BY p.id, p.nome_completo, p.foto_url
  ORDER BY pontos_total DESC;
END;
$$;

-- Function 2: Get cell competition ranking
CREATE OR REPLACE FUNCTION public.get_ranking_disputa_celulas()
RETURNS TABLE (
  nome_celula TEXT, 
  total_pontos BIGINT, 
  total_membros BIGINT,
  posicao INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(c.nome, 'Célula sem nome') as nome_celula,
    COALESCE(SUM(qr.pontos_ganhos), 0)::BIGINT as total_pontos,
    COUNT(DISTINCT p.id)::BIGINT as total_membros,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(qr.pontos_ganhos), 0) DESC)::INTEGER as posicao
  FROM public.celulas c
  LEFT JOIN public.pessoas p ON c.id = p.celula_id AND p.situacao = 'ativo'
  LEFT JOIN public.quiz_resultados qr ON p.id::text = qr.pessoa_id
  GROUP BY c.id, c.nome
  HAVING COUNT(DISTINCT p.id) > 0  -- Only cells with active members
  ORDER BY total_pontos DESC;
END;
$$;

-- Function 3: Get general ranking with pagination
CREATE OR REPLACE FUNCTION public.get_ranking_geral(limite INTEGER DEFAULT 100, offset_val INTEGER DEFAULT 0)
RETURNS TABLE (
  pessoa_id TEXT,
  pontos_total BIGINT, 
  nome_completo TEXT, 
  foto_url TEXT,
  posicao INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    qr.pessoa_id,
    SUM(qr.pontos_ganhos)::BIGINT as pontos_total,
    p.nome_completo,
    p.foto_url,
    (ROW_NUMBER() OVER (ORDER BY SUM(qr.pontos_ganhos) DESC) + offset_val)::INTEGER as posicao
  FROM public.quiz_resultados qr
  JOIN public.pessoas p ON p.id::text = qr.pessoa_id
  WHERE p.situacao = 'ativo'
  GROUP BY qr.pessoa_id, p.nome_completo, p.foto_url
  ORDER BY pontos_total DESC
  LIMIT limite OFFSET offset_val;
END;
$$;