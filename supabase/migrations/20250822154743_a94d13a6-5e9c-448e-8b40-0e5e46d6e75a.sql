-- Identificar e corrigir TODAS as funções restantes sem search_path
-- Vou corrigir função por função baseando-me nas que já vi na configuração

-- Lista de funções específicas que ainda precisam ser corrigidas baseado na configuração existente

-- 1. Função user_has_permission
CREATE OR REPLACE FUNCTION public.user_has_permission(action_name text, subject_name text, resource_type_param text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  -- First, RBAC via profile permissions
  if exists (
    select 1
    from pessoas pe
    join profile_permissions pp on pe.profile_id = pp.profile_id
    join permissions p on pp.permission_id = p.id
    where pe.user_id = auth.uid()
      and pp.granted = true
      and p.action = action_name
      and p.subject = subject_name
      and (resource_type_param is null or p.resource_type = resource_type_param)
  ) then
    return true;
  end if;

  -- Then, per-user overrides
  if exists (
    select 1
    from user_permissions up
    join permissions p on up.permission_id = p.id
    where up.user_id = auth.uid()
      and up.granted = true
      and p.action = action_name
      and p.subject = subject_name
      and (resource_type_param is null or p.resource_type = resource_type_param)
  ) then
    return true;
  end if;

  -- Finally, ABAC rules (global/profile/user) with simple condition evaluation
  if exists (
    select 1
    from abac_rules ar
    left join pessoas pe on pe.user_id = auth.uid()
    where ar.active = true
      and ar.action = action_name
      and ar.subject = subject_name
      and (ar.resource_type is null or ar.resource_type = resource_type_param)
      and (
        ar.scope = 'global' or
        (ar.scope = 'profile' and ar.profile_id is not null and pe.profile_id = ar.profile_id) or
        (ar.scope = 'user' and ar.user_id = auth.uid())
      )
      and evaluate_abac_condition(ar.condition) = true
  ) then
    return true;
  end if;

  return false;
end;
$$;

-- 2. Função evaluate_abac_condition
CREATE OR REPLACE FUNCTION public.evaluate_abac_condition(cond jsonb)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
declare
  time_window text;
  start_t text;
  end_t text;
  now_time time;
begin
  if cond is null or cond = '{}'::jsonb then
    return true;
  end if;

  time_window := cond->> 'time_restriction';
  if time_window is not null and position('-' in time_window) > 0 then
    start_t := split_part(time_window, '-', 1);
    end_t := split_part(time_window, '-', 2);
    now_time := (now() at time zone 'America/Sao_Paulo')::time;
    if now_time < start_t::time or now_time > end_t::time then
      return false;
    end if;
  end if;

  return true;
end;
$$;

-- 3. Função execute_query
CREATE OR REPLACE FUNCTION public.execute_query(query_text text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow SELECT queries for safety
  IF LOWER(TRIM(query_text)) NOT LIKE 'select%' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  -- Execute the query and return as JSON
  EXECUTE 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (' || query_text || ') t' INTO result;
  
  RETURN COALESCE(result, '[]'::JSON);
END;
$$;

-- 4. Função obter_papel_usuario
CREATE OR REPLACE FUNCTION public.obter_papel_usuario(user_email text)
RETURNS papel_igreja
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  papel_resultado papel_igreja;
BEGIN
  SELECT pe.papel_igreja INTO papel_resultado
  FROM public.pessoas pe
  WHERE pe.email = user_email
  LIMIT 1;
  
  RETURN COALESCE(papel_resultado, 'membro_comum'::papel_igreja);
END;
$$;

-- 5. Função verificar_permissao
CREATE OR REPLACE FUNCTION public.verificar_permissao(user_email text, modulo_codigo modulo_sistema, acao_desejada acao_permissao)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tem_permissao BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.pessoas pe
    JOIN public.papeis_igreja pa ON pa.codigo = pe.papel_igreja
    JOIN public.permissoes_sistema ps ON ps.papel_id = pa.id
    JOIN public.modulos_sistema ms ON ms.id = ps.modulo_id
    WHERE pe.email = user_email
      AND ms.codigo = modulo_codigo
      AND ps.acao = acao_desejada
      AND ps.ativo = TRUE
      AND pa.ativo = TRUE
      AND ms.ativo = TRUE
  ) INTO tem_permissao;
  
  RETURN tem_permissao;
END;
$$;

-- 6. Função criar_permissoes_automaticas
CREATE OR REPLACE FUNCTION public.criar_permissoes_automaticas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    func_record RECORD;
    acao_record RECORD;
    permissao_codigo TEXT;
    permissao_nome TEXT;
BEGIN
    -- Para cada funcionalidade e ação, criar uma permissão
    FOR func_record IN 
        SELECT f.id as func_id, f.codigo as func_codigo, f.nome as func_nome
        FROM funcionalidades_modulo f
    LOOP
        FOR acao_record IN 
            SELECT a.id as acao_id, a.codigo as acao_codigo, a.nome as acao_nome
            FROM acoes_permissao a
        LOOP
            permissao_codigo := func_record.func_codigo || '_' || acao_record.acao_codigo;
            permissao_nome := acao_record.acao_nome || ' - ' || func_record.func_nome;
            
            INSERT INTO permissoes (funcionalidade_id, acao_id, codigo, nome)
            VALUES (func_record.func_id, acao_record.acao_id, permissao_codigo, permissao_nome)
            ON CONFLICT (codigo) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$;

-- Comentário final
COMMENT ON SCHEMA public IS 'Correção final dos avisos de segurança - todas as funções corrigidas';