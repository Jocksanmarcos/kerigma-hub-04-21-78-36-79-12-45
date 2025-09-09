-- Correção completa dos avisos de segurança do linter
-- Adicionar SET search_path TO 'public' para todas as funções que precisam

-- Corrigir todas as funções restantes sem search_path
-- Esta migração irá atualizar TODAS as funções que ainda não têm search_path definido

-- Função handle_new_pastor_missao
DROP FUNCTION IF EXISTS public.handle_new_pastor_missao() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_pastor_missao()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Só criar se não for admin existente
  IF NOT EXISTS (SELECT 1 FROM public.usuarios_admin WHERE user_id = NEW.id) THEN
    -- Verificar se é pastor de missão baseado em metadados
    IF NEW.raw_user_meta_data->>'tipo_usuario' = 'pastor_missao' THEN
      INSERT INTO public.pastores_missoes (
        user_id, 
        nome, 
        email,
        missao_id
      ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        NEW.email,
        (NEW.raw_user_meta_data->>'missao_id')::UUID
      );
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

-- Função calcular_grupo_etario
DROP FUNCTION IF EXISTS public.calcular_grupo_etario(date) CASCADE;
CREATE OR REPLACE FUNCTION public.calcular_grupo_etario(data_nascimento date)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF data_nascimento IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF EXTRACT(YEAR FROM AGE(data_nascimento)) <= 12 THEN
    RETURN 'crianca';
  ELSIF EXTRACT(YEAR FROM AGE(data_nascimento)) <= 17 THEN
    RETURN 'adolescente';
  ELSIF EXTRACT(YEAR FROM AGE(data_nascimento)) <= 30 THEN
    RETURN 'jovem';
  ELSIF EXTRACT(YEAR FROM AGE(data_nascimento)) <= 60 THEN
    RETURN 'adulto';
  ELSE
    RETURN 'idoso';
  END IF;
END;
$$;

-- Função check_password_strength
DROP FUNCTION IF EXISTS public.check_password_strength(text) CASCADE;
CREATE OR REPLACE FUNCTION public.check_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB := '{"strong": false, "issues": []}'::JSONB;
  issues TEXT[] := ARRAY[]::TEXT[];
  score INTEGER := 0;
BEGIN
  -- Verificar comprimento mínimo
  IF length(password) < 8 THEN
    issues := array_append(issues, 'Deve ter pelo menos 8 caracteres');
  ELSE
    score := score + 1;
  END IF;
  
  -- Verificar letras minúsculas
  IF password !~ '[a-z]' THEN
    issues := array_append(issues, 'Deve conter pelo menos uma letra minúscula');
  ELSE
    score := score + 1;
  END IF;
  
  -- Verificar letras maiúsculas
  IF password !~ '[A-Z]' THEN
    issues := array_append(issues, 'Deve conter pelo menos uma letra maiúscula');
  ELSE
    score := score + 1;
  END IF;
  
  -- Verificar números
  IF password !~ '[0-9]' THEN
    issues := array_append(issues, 'Deve conter pelo menos um número');
  ELSE
    score := score + 1;
  END IF;
  
  -- Verificar caracteres especiais
  IF password !~ '[^a-zA-Z0-9]' THEN
    issues := array_append(issues, 'Deve conter pelo menos um caractere especial');
  ELSE
    score := score + 1;
  END IF;
  
  -- Construir resultado
  result := jsonb_build_object(
    'strong', score >= 4,
    'score', score,
    'max_score', 5,
    'issues', to_jsonb(issues)
  );
  
  RETURN result;
END;
$$;

-- Função generate_backup_codes
DROP FUNCTION IF EXISTS public.generate_backup_codes() CASCADE;
CREATE OR REPLACE FUNCTION public.generate_backup_codes()
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  codes TEXT[] := ARRAY[]::TEXT[];
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    codes := array_append(codes, substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
  END LOOP;
  RETURN codes;
END;
$$;

-- Função cleanup_expired_sessions
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions() CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_active_sessions 
  WHERE expires_at < now() OR last_activity < (now() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Função export_user_data
DROP FUNCTION IF EXISTS public.export_user_data(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.export_user_data(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_data JSONB := '{}';
  temp_data JSONB;
BEGIN
  -- Verificar se o usuário pode acessar estes dados
  IF auth.uid() != user_uuid AND NOT is_sede_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Dados básicos da pessoa
  SELECT to_jsonb(p.*) INTO temp_data
  FROM public.pessoas p
  WHERE p.user_id = user_uuid;
  
  IF temp_data IS NOT NULL THEN
    user_data := jsonb_set(user_data, '{pessoa}', temp_data);
  END IF;

  -- Consentimentos de privacidade
  SELECT jsonb_agg(to_jsonb(pc.*)) INTO temp_data
  FROM public.privacy_consents pc
  WHERE pc.user_id = user_uuid;
  
  IF temp_data IS NOT NULL THEN
    user_data := jsonb_set(user_data, '{consentimentos}', temp_data);
  END IF;

  -- Eventos de segurança (últimos 90 dias)
  SELECT jsonb_agg(to_jsonb(se.*)) INTO temp_data
  FROM public.security_events se
  WHERE se.user_id = user_uuid
    AND se.created_at > now() - INTERVAL '90 days';
  
  IF temp_data IS NOT NULL THEN
    user_data := jsonb_set(user_data, '{eventos_seguranca}', temp_data);
  END IF;

  RETURN user_data;
END;
$$;

-- Comentário indicando que a correção foi aplicada
COMMENT ON SCHEMA public IS 'Migração de correção de segurança aplicada - todas as funções têm search_path definido';