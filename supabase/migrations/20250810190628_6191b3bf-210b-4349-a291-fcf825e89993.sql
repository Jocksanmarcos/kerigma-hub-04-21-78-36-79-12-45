-- ===== CORREÇÃO FINAL DAS FUNÇÕES SEM SEARCH_PATH =====

-- Corrigir funções existentes para adicionar search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.obter_ranking_ensino()
RETURNS TABLE(pessoa_id uuid, nome text, total_pontos integer, badges_count integer, cursos_concluidos integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome_completo,
    COALESCE(SUM(ce.pontos_ganhos), 0)::INTEGER as total_pontos,
    COUNT(DISTINCT ce.badge_id)::INTEGER as badges_count,
    COUNT(DISTINCT CASE WHEN me.status = 'concluido' THEN me.id END)::INTEGER as cursos_concluidos
  FROM pessoas p
  LEFT JOIN conquistas_ensino ce ON p.id = ce.pessoa_id
  LEFT JOIN matriculas_ensino me ON p.id = me.pessoa_id
  GROUP BY p.id, p.nome_completo
  HAVING COALESCE(SUM(ce.pontos_ganhos), 0) > 0
  ORDER BY total_pontos DESC, badges_count DESC, cursos_concluidos DESC
  LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.obter_estatisticas_pessoas()
RETURNS TABLE(total_pessoas bigint, total_membros bigint, total_visitantes bigint, total_lideres bigint, total_batizados bigint, total_em_discipulado bigint, crescimento_mes_atual bigint, pessoas_por_grupo_etario jsonb, pessoas_por_estado_espiritual jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.pessoas WHERE situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'membro' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'visitante' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'lider' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE data_batismo IS NOT NULL AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE status_discipulado = 'em_andamento' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND situacao = 'ativo')::BIGINT,
    (SELECT jsonb_object_agg(grupo_etario, count) 
     FROM (
       SELECT calcular_grupo_etario(data_nascimento) as grupo_etario, COUNT(*) as count 
       FROM public.pessoas 
       WHERE situacao = 'ativo' AND data_nascimento IS NOT NULL
       GROUP BY calcular_grupo_etario(data_nascimento)
     ) sub),
    (SELECT jsonb_object_agg(estado_espiritual, count) 
     FROM (
       SELECT estado_espiritual, COUNT(*) as count 
       FROM public.pessoas 
       WHERE situacao = 'ativo'
       GROUP BY estado_espiritual
     ) sub);
END;
$function$;

CREATE OR REPLACE FUNCTION public.obter_estatisticas_financeiras()
RETURNS TABLE(saldo_total numeric, receitas_mes numeric, despesas_mes numeric, campanhas_ativas integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COALESCE(SUM(saldo_atual), 0) FROM public.contas_bancarias WHERE ativa = true),
    (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros_v2 
     WHERE tipo = 'receita' AND status = 'confirmado' 
     AND EXTRACT(MONTH FROM data_lancamento) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM data_lancamento) = EXTRACT(YEAR FROM CURRENT_DATE)),
    (SELECT COALESCE(SUM(valor), 0) FROM public.lancamentos_financeiros_v2 
     WHERE tipo = 'despesa' AND status = 'confirmado'
     AND EXTRACT(MONTH FROM data_lancamento) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM data_lancamento) = EXTRACT(YEAR FROM CURRENT_DATE)),
    (SELECT COUNT(*)::INTEGER FROM public.campanhas_financeiras WHERE ativa = true)::INTEGER;
END;
$function$;

CREATE OR REPLACE FUNCTION public.obter_estatisticas_ensino()
RETURNS TABLE(total_cursos bigint, total_turmas_ativas bigint, total_alunos_matriculados bigint, total_alunos_concluidos bigint, taxa_conclusao numeric, alunos_por_status jsonb, cursos_por_categoria jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.cursos WHERE ativo = true)::BIGINT,
    (SELECT COUNT(*) FROM public.turmas WHERE status = 'em_andamento')::BIGINT,
    (SELECT COUNT(*) FROM public.matriculas WHERE status IN ('matriculado', 'cursando'))::BIGINT,
    (SELECT COUNT(*) FROM public.matriculas WHERE status = 'concluido')::BIGINT,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.matriculas) > 0 THEN
        (SELECT COUNT(*) FROM public.matriculas WHERE status = 'concluido')::DECIMAL / 
        (SELECT COUNT(*) FROM public.matriculas)::DECIMAL * 100
      ELSE 0
    END,
    (SELECT jsonb_object_agg(status, count) 
     FROM (
       SELECT status, COUNT(*) as count 
       FROM public.matriculas 
       GROUP BY status
     ) sub),
    (SELECT jsonb_object_agg(categoria, count) 
     FROM (
       SELECT categoria, COUNT(*) as count 
       FROM public.cursos 
       WHERE ativo = true
       GROUP BY categoria
     ) sub);
END;
$function$;

CREATE OR REPLACE FUNCTION public.obter_estatisticas_multiplicacao()
RETURNS TABLE(total_celulas_originais bigint, total_celulas_multiplicadas bigint, geracao_maxima integer, celulas_por_geracao jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.celulas WHERE celula_mae_id IS NULL)::BIGINT,
    (SELECT COUNT(*) FROM public.celulas WHERE celula_mae_id IS NOT NULL)::BIGINT,
    (SELECT MAX(geracao) FROM public.celulas),
    (SELECT jsonb_object_agg(geracao::text, count::text) 
     FROM (
       SELECT geracao, COUNT(*) as count 
       FROM public.celulas 
       GROUP BY geracao 
       ORDER BY geracao
     ) sub);
END;
$function$;

CREATE OR REPLACE FUNCTION public.obter_estatisticas_dashboard()
RETURNS TABLE(total_membros_ativos bigint, total_lideres bigint, aniversariantes_hoje bigint, novos_membros_30_dias bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.pessoas WHERE situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'lider' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE 
      DATE_PART('month', data_nascimento) = DATE_PART('month', CURRENT_DATE) AND
      DATE_PART('day', data_nascimento) = DATE_PART('day', CURRENT_DATE) AND
      situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE 
      created_at >= CURRENT_DATE - INTERVAL '30 days' AND 
      situacao = 'ativo')::BIGINT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.obter_estatisticas_familias()
RETURNS TABLE(total_familias bigint, familias_com_criancas bigint, familias_monoparentais bigint, media_membros_por_familia numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.familias)::BIGINT,
    (SELECT COUNT(DISTINCT f.id) 
     FROM public.familias f 
     JOIN public.vinculos_familiares vf ON f.id = vf.familia_id 
     JOIN public.pessoas p ON vf.pessoa_id = p.id 
     WHERE p.data_nascimento IS NOT NULL 
     AND EXTRACT(YEAR FROM AGE(p.data_nascimento)) < 18)::BIGINT,
    (SELECT COUNT(DISTINCT f.id) 
     FROM public.familias f 
     JOIN public.vinculos_familiares vf ON f.id = vf.familia_id 
     WHERE vf.tipo_vinculo IN ('pai', 'mae')
     GROUP BY f.id 
     HAVING COUNT(*) = 1)::BIGINT,
    (SELECT ROUND(AVG(membro_count), 2) 
     FROM (
       SELECT COUNT(*) as membro_count 
       FROM public.vinculos_familiares 
       GROUP BY familia_id
     ) as familia_sizes);
END;
$function$;

-- ===== EDGE FUNCTION PARA NOTIFICAÇÕES =====

-- Criar função auxiliar para enviar notificações (será chamada pela edge function)
CREATE OR REPLACE FUNCTION public.mark_notification_as_sent(
  p_notification_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE notificacoes_escala 
  SET 
    enviado = true,
    data_envio = now()
  WHERE id = p_notification_id;
  
  RETURN FOUND;
END;
$$;

-- Função para obter notificações não enviadas
CREATE OR REPLACE FUNCTION public.get_pending_notifications()
RETURNS TABLE (
  notification_id UUID,
  escala_id UUID,
  pessoa_id UUID,
  pessoa_nome TEXT,
  pessoa_email TEXT,
  tipo_notificacao TEXT,
  conteudo_mensagem TEXT,
  metodo_envio TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ne.id,
    ne.escala_servico_id,
    es.pessoa_id,
    p.nome_completo,
    p.email,
    ne.tipo_notificacao,
    ne.conteudo_mensagem,
    ne.metodo_envio
  FROM notificacoes_escala ne
  JOIN escalas_servico es ON es.id = ne.escala_servico_id
  JOIN pessoas p ON p.id = es.pessoa_id
  WHERE ne.enviado = false
  AND p.email IS NOT NULL
  ORDER BY ne.created_at ASC
  LIMIT 50;
END;
$$;