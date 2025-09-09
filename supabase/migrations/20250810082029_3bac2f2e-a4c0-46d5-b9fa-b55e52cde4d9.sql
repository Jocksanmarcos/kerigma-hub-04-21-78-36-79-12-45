-- Create consolidated pending actions function
CREATE OR REPLACE FUNCTION public.get_user_pending_actions()
RETURNS TABLE (
  tipo_tarefa text,
  descricao text,
  link_acao text,
  data_criacao timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  -- 1) Relatórios de célula pendentes de aprovação onde o usuário supervisiona
  SELECT
    'Relatório'::text AS tipo_tarefa,
    'Relatório da célula ' || COALESCE(c.nome, left(c.id::text, 6)) || ' aguarda aprovação' AS descricao,
    '/dashboard/celulas'::text AS link_acao,
    COALESCE(r.created_at, r.data_reuniao::timestamp) AS data_criacao
  FROM relatorios_semanais_celulas r
  JOIN celulas c ON c.id = r.celula_id
  WHERE lower(COALESCE(r.status, 'pendente')) IN ('pendente','pendente_aprovacao','aguardando_aprovacao')
    AND (c.supervisor_id = get_current_person_id() OR c.coordenador_id = get_current_person_id())

  UNION ALL

  -- 2) Lançamentos financeiros pendentes
  SELECT
    'Financeiro'::text AS tipo_tarefa,
    (CASE WHEN NULLIF(l.descricao,'') IS NOT NULL
          THEN 'Lançamento: ' || l.descricao || ' pendente'
          ELSE 'Lançamento financeiro pendente' END) AS descricao,
    '/dashboard/financeiro'::text AS link_acao,
    COALESCE(l.created_at, now()) AS data_criacao
  FROM lancamentos_financeiros_v2 l
  WHERE lower(COALESCE(l.status, 'pendente')) IN ('pendente','aguardando_aprovacao')

  UNION ALL

  -- 3) Visitantes atribuídos ao usuário para acompanhamento
  SELECT
    'Jornada'::text AS tipo_tarefa,
    'Visitante ' || COALESCE(v.nome,'sem nome') || ' aguardando contato' AS descricao,
    '/dashboard/pessoas'::text AS link_acao,
    v.created_at AS data_criacao
  FROM visitantes_celulas v
  WHERE v.responsavel_acompanhamento = get_current_person_id()
    AND (v.status_acompanhamento IS NULL OR lower(v.status_acompanhamento) IN ('novo','pendente','em_andamento'))
$$;