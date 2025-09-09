-- Ajustar funções SECURITY DEFINER restantes sem search_path

-- verificar_conflitos_turma
CREATE OR REPLACE FUNCTION public.verificar_conflitos_turma(
  p_professor_responsavel text,
  p_dias_semana text[],
  p_horario_inicio time without time zone,
  p_horario_fim time without time zone,
  p_data_inicio date,
  p_data_fim date,
  p_turma_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(tipo_conflito text, descricao text, gravidade integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar conflitos com outras turmas do mesmo professor
  RETURN QUERY
  SELECT 
    'professor_ocupado'::TEXT as tipo_conflito,
    'Professor já tem turma agendada no mesmo horário'::TEXT as descricao,
    3::INTEGER as gravidade
  FROM turmas_ensino t
  WHERE t.professor_responsavel = p_professor_responsavel
    AND t.status IN ('planejado', 'em_andamento')
    AND (p_turma_id IS NULL OR t.id != p_turma_id)
    AND t.dias_semana && p_dias_semana
    AND t.horario_inicio < p_horario_fim
    AND t.horario_fim > p_horario_inicio
    AND (
      (t.data_inicio <= p_data_fim AND t.data_fim >= p_data_inicio) OR
      (p_data_inicio <= t.data_fim AND p_data_fim >= t.data_inicio)
    );

  -- Verificar conflitos com bloqueios acadêmicos
  RETURN QUERY
  SELECT 
    'data_bloqueada'::TEXT as tipo_conflito,
    b.titulo || ' - ' || COALESCE(b.descricao, 'Data não disponível para aulas')::TEXT as descricao,
    CASE WHEN b.tipo = 'bloqueio' THEN 3 ELSE 2 END::INTEGER as gravidade
  FROM bloqueios_academicos b
  WHERE b.ativo = true
    AND b.data_inicio <= p_data_fim
    AND b.data_fim >= p_data_inicio;
END;
$$;

-- get_user_congregacao_id
CREATE OR REPLACE FUNCTION public.get_user_congregacao_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT p.congregacao_id 
    FROM public.pessoas p
    WHERE p.user_id = auth.uid() 
    LIMIT 1
  );
END;
$$;

-- handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_profile_id UUID;
BEGIN
  SELECT id INTO default_profile_id
  FROM public.profiles 
  WHERE name = 'Membro' 
  LIMIT 1;

  INSERT INTO public.pessoas (
    user_id, 
    email, 
    nome_completo,
    profile_id,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    default_profile_id,
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil de pessoa: %', SQLERRM;
    RETURN NEW;
END;
$$;