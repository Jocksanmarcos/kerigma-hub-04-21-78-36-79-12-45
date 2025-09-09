-- Corrigir avisos de segurança do linter

-- 1. Identificar e corrigir funções sem search_path definido
-- Listar funções que precisam ser corrigidas
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN (
        'get_current_person_id',
        'update_updated_at_column',
        'handle_new_user',
        'calcular_grupo_etario_texto',
        'handle_auth_user_update'
    );

-- Atualizar funções específicas para incluir SET search_path TO 'public'

-- Função get_current_person_id (se existir)
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  person_id UUID;
BEGIN
  SELECT id INTO person_id
  FROM public.pessoas
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN person_id;
END;
$$;

-- Função update_updated_at_column (se existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função handle_new_user (se existir)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.pessoas (
    user_id,
    nome_completo,
    email,
    church_id
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    NEW.email,
    get_user_church_id()
  );
  RETURN NEW;
END;
$$;

-- Função calcular_grupo_etario_texto (se existir)
CREATE OR REPLACE FUNCTION public.calcular_grupo_etario_texto(data_nascimento date)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  IF data_nascimento IS NULL THEN
    RETURN 'Não informado';
  END IF;
  
  CASE calcular_grupo_etario(data_nascimento)
    WHEN 'crianca' THEN RETURN 'Criança (0-12 anos)';
    WHEN 'adolescente' THEN RETURN 'Adolescente (13-17 anos)';
    WHEN 'jovem' THEN RETURN 'Jovem (18-30 anos)';
    WHEN 'adulto' THEN RETURN 'Adulto (31-60 anos)';
    WHEN 'idoso' THEN RETURN 'Idoso (60+ anos)';
    ELSE RETURN 'Não informado';
  END CASE;
END;
$$;

-- Função handle_auth_user_update (se existir)
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.pessoas
  SET 
    email = NEW.email,
    updated_at = now()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- 2. Verificar se a proteção de senha vazada pode ser habilitada via SQL
-- (Nota: Este setting geralmente precisa ser configurado via dashboard do Supabase)
COMMENT ON SCHEMA public IS 'Migração aplicada para corrigir avisos de segurança do linter: search_path definido para funções';