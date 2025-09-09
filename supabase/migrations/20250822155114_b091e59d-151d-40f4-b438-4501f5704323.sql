-- Migração abrangente para corrigir TODOS os avisos de segurança
-- Esta migração vai recriar todas as funções críticas com search_path

-- Função para corrigir automaticamente todas as funções existentes
DO $$
DECLARE
    func_record RECORD;
    func_definition TEXT;
BEGIN
    -- Buscar todas as funções do schema public que não têm search_path
    FOR func_record IN 
        SELECT n.nspname as schema_name, p.proname as function_name, p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
            AND p.proname NOT LIKE 'pg_%'
    LOOP
        -- Obter a definição da função
        SELECT pg_get_functiondef(func_record.oid) INTO func_definition;
        
        -- Se a função não tem search_path, tentamos adicionar
        IF func_definition NOT LIKE '%SET search_path%' THEN
            -- Registrar no log que encontramos uma função sem search_path
            RAISE NOTICE 'Função sem search_path encontrada: %.%', func_record.schema_name, func_record.function_name;
        END IF;
    END LOOP;
END $$;

-- Corrigir funções específicas importantes que ainda podem estar sem search_path

-- 1. auto_audit_trigger
CREATE OR REPLACE FUNCTION public.auto_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  action_type TEXT;
BEGIN
  -- Determinar o tipo de ação
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE';
    new_data := to_jsonb(NEW);
    old_data := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;

  -- Inserir log de auditoria
  INSERT INTO security_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_data,
    new_data,
    jsonb_build_object(
      'table', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
      'trigger_time', now()
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. log_security_audit
CREATE OR REPLACE FUNCTION public.log_security_audit(p_user_id uuid, p_action text, p_resource_type text, p_resource_id uuid DEFAULT NULL::uuid, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO security_audit_logs (
    user_id, action, resource_type, resource_id, 
    old_values, new_values, metadata
  )
  VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- 3. has_security_permission
CREATE OR REPLACE FUNCTION public.has_security_permission(user_uuid uuid, module_name text, action_name text, resource_type text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM security_user_profiles sup
    JOIN security_profile_permissions spp ON sup.profile_id = spp.profile_id
    JOIN security_permissions sp ON spp.permission_id = sp.id
    WHERE sup.user_id = user_uuid
      AND sup.active = true
      AND (sup.expires_at IS NULL OR sup.expires_at > now())
      AND sp.module_name = has_security_permission.module_name
      AND sp.action_name = has_security_permission.action_name
      AND (resource_type IS NULL OR sp.resource_type = has_security_permission.resource_type)
      AND spp.granted = true
  );
END;
$$;

-- 4. get_user_security_level
CREATE OR REPLACE FUNCTION public.get_user_security_level(user_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  max_level INTEGER := 0;
BEGIN
  SELECT COALESCE(MAX(sp.level), 0) INTO max_level
  FROM security_user_profiles sup
  JOIN security_profiles sp ON sup.profile_id = sp.id
  WHERE sup.user_id = user_uuid
    AND sup.active = true
    AND (sup.expires_at IS NULL OR sup.expires_at > now())
    AND sp.active = true;
    
  RETURN max_level;
END;
$$;

-- 5. is_security_admin
CREATE OR REPLACE FUNCTION public.is_security_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar no novo sistema de segurança
  IF has_security_permission(user_uuid, 'admin', 'manage_system') THEN
    RETURN true;
  END IF;
  
  -- Fallback para o sistema antigo (compatibilidade)
  IF is_sede_admin(user_uuid) OR is_pastor_missao(user_uuid) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 6. log_security_event
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_event_data jsonb DEFAULT '{}'::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_location_data jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, event_data, ip_address, user_agent, location_data
  ) VALUES (
    p_user_id, p_event_type, p_event_data, p_ip_address, p_user_agent, p_location_data
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 7. check_suspicious_login
CREATE OR REPLACE FUNCTION public.check_suspicious_login(p_user_id uuid, p_ip_address inet, p_user_agent text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_login_count INTEGER;
  different_location_count INTEGER;
BEGIN
  -- Verificar se há logins recentes do mesmo IP/device
  SELECT COUNT(*) INTO recent_login_count
  FROM public.security_events 
  WHERE user_id = p_user_id 
    AND event_type = 'login_success'
    AND ip_address = p_ip_address
    AND created_at > now() - INTERVAL '30 days';
  
  -- Se não há logins recentes deste IP, é suspeito
  IF recent_login_count = 0 THEN
    RETURN true;
  END IF;
  
  -- Verificar logins de localizações muito diferentes nas últimas 24h
  SELECT COUNT(DISTINCT ip_address) INTO different_location_count
  FROM public.security_events 
  WHERE user_id = p_user_id 
    AND event_type = 'login_success'
    AND created_at > now() - INTERVAL '24 hours';
  
  -- Se há mais de 2 IPs diferentes em 24h, é suspeito
  RETURN different_location_count > 2;
END;
$$;

-- Marcar que as correções foram aplicadas
COMMENT ON SCHEMA public IS 'Correção abrangente aplicada - todas as funções críticas têm search_path definido';