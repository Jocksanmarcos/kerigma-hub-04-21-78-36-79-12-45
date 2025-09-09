-- ETAPA 1: ESTRUTURAÇÃO DA BASE DE DADOS MULTI-IGREJA (Corrigida)

-- Criar tabela de igrejas
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  cnpj TEXT,
  type TEXT NOT NULL DEFAULT 'missao' CHECK (type IN ('sede', 'missao')),
  parent_church_id UUID REFERENCES public.churches(id),
  pastor_responsavel TEXT,
  data_fundacao DATE,
  email TEXT,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar enum para roles do sistema
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'church_role') THEN
    CREATE TYPE church_role AS ENUM (
      'super_admin',
      'pastor', 
      'tesoureiro',
      'lider_celula',
      'secretario',
      'membro'
    );
  END IF;
END $$;

-- Criar tabela de roles de usuários por igreja
CREATE TABLE IF NOT EXISTS public.user_church_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  role church_role NOT NULL DEFAULT 'membro',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, church_id, role)
);

-- Inserir igreja sede padrão
INSERT INTO public.churches (id, name, type, address, email) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Igreja Sede - CBN Kerigma',
  'sede',
  'Endereço da Sede',
  'sede@cbnkerigma.com.br'
) ON CONFLICT (id) DO NOTHING;

-- Adicionar church_id às tabelas existentes (apenas as que existem)
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.lancamentos_financeiros_v2 ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- Atualizar dados existentes para referenciar a sede
UPDATE public.pessoas SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE public.lancamentos_financeiros_v2 SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE public.cursos SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;

-- ETAPA 2: FUNÇÕES DE SEGURANÇA

-- Função para obter church_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_church_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_church_id UUID;
BEGIN
  SELECT church_id INTO result_church_id
  FROM public.user_church_roles
  WHERE user_id = auth.uid() 
    AND active = true
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'pastor' THEN 2
      ELSE 3
    END
  LIMIT 1;
  
  RETURN COALESCE(result_church_id, '00000000-0000-0000-0000-000000000001');
END;
$$;

-- Função para verificar se usuário é super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_church_roles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND active = true
  );
END;
$$;

-- Função para verificar se usuário pode acessar igreja específica
CREATE OR REPLACE FUNCTION public.can_access_church(target_church_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admin pode acessar qualquer igreja
  IF is_super_admin() THEN
    RETURN true;
  END IF;
  
  -- Usuário normal só pode acessar sua própria igreja
  RETURN EXISTS (
    SELECT 1
    FROM public.user_church_roles
    WHERE user_id = auth.uid()
      AND church_id = target_church_id
      AND active = true
  );
END;
$$;