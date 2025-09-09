-- Verificar enum atual e corrigir
DO $$
BEGIN
  -- Verificar se o enum app_role existe
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    -- Adicionar valores se não existirem
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role') AND enumlabel = 'pastor') THEN
      ALTER TYPE app_role ADD VALUE 'pastor';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role') AND enumlabel = 'lider') THEN
      ALTER TYPE app_role ADD VALUE 'lider';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role') AND enumlabel = 'membro') THEN
      ALTER TYPE app_role ADD VALUE 'membro';
    END IF;
  ELSE
    -- Criar enum se não existir
    CREATE TYPE app_role AS ENUM ('pastor', 'lider', 'membro');
  END IF;
END $$;

-- Criar função para verificar se é líder de célula
CREATE OR REPLACE FUNCTION public.is_lider_celula(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pessoas 
    WHERE user_id = user_uuid 
    AND papel_lideranca = 'lider_celula'
    AND situacao = 'ativo'
  );
END;
$$;

-- Criar função para detectar papel combinado de usuário
CREATE OR REPLACE FUNCTION public.get_combined_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
  pessoa_papel text;
BEGIN
  -- Buscar role na tabela user_roles
  SELECT ur.role INTO user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
  AND ur.active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Buscar papel de liderança da pessoa
  SELECT p.papel_lideranca INTO pessoa_papel
  FROM pessoas p
  WHERE p.user_id = auth.uid()
  AND p.situacao = 'ativo'
  LIMIT 1;
  
  -- Retornar o papel mais específico
  IF user_role = 'pastor' THEN
    RETURN 'pastor';
  ELSIF user_role = 'lider' OR pessoa_papel = 'lider_celula' THEN
    RETURN 'lider';
  ELSE
    RETURN 'membro';
  END IF;
END;
$$;