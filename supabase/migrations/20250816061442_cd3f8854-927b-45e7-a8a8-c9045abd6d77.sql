-- ETAPA 1: ESTRUTURAÇÃO DA BASE DE DADOS MULTI-IGREJA

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
CREATE TYPE IF NOT EXISTS church_role AS ENUM (
  'super_admin',
  'pastor', 
  'tesoureiro',
  'lider_celula',
  'secretario',
  'membro'
);

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

-- Adicionar church_id às tabelas existentes
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.celulas ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.lancamentos_financeiros_v2 ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.cursos ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.patrimonio ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- Atualizar dados existentes para referenciar a sede
UPDATE public.pessoas SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE public.celulas SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;
UPDATE public.lancamentos_financeiros_v2 SET church_id = '00000000-0000-0000-0000-000000000001' WHERE church_id IS NULL;

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

-- ETAPA 2: IMPLEMENTAÇÃO DAS POLÍTICAS RLS

-- Habilitar RLS nas tabelas principais
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_church_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para churches
CREATE POLICY "Super admins can view all churches" ON public.churches
  FOR SELECT USING (is_super_admin());

CREATE POLICY "Users can view their own church" ON public.churches
  FOR SELECT USING (can_access_church(id));

CREATE POLICY "Super admins can manage churches" ON public.churches
  FOR ALL USING (is_super_admin());

-- Políticas para user_church_roles
CREATE POLICY "Super admins can manage all roles" ON public.user_church_roles
  FOR ALL USING (is_super_admin());

CREATE POLICY "Users can view roles in their church" ON public.user_church_roles
  FOR SELECT USING (can_access_church(church_id));

-- Atualizar políticas existentes para incluir church_id

-- Políticas para pessoas
DROP POLICY IF EXISTS "usuarios_podem_ver_proprias_informacoes" ON public.pessoas;
CREATE POLICY "users_can_access_church_pessoas" ON public.pessoas
  FOR SELECT USING (can_access_church(church_id) OR is_super_admin());

DROP POLICY IF EXISTS "usuarios_podem_atualizar_proprio_perfil" ON public.pessoas;
CREATE POLICY "users_can_update_church_pessoas" ON public.pessoas
  FOR UPDATE USING (can_access_church(church_id) OR is_super_admin());

DROP POLICY IF EXISTS "usuarios_podem_criar_proprio_perfil" ON public.pessoas;
CREATE POLICY "users_can_create_church_pessoas" ON public.pessoas
  FOR INSERT WITH CHECK (can_access_church(church_id) OR is_super_admin());

DROP POLICY IF EXISTS "apenas_admins_podem_deletar_pessoas" ON public.pessoas;
CREATE POLICY "admins_can_delete_church_pessoas" ON public.pessoas
  FOR DELETE USING (can_access_church(church_id) OR is_super_admin());

-- Políticas para lançamentos financeiros
DROP POLICY IF EXISTS "Tesoureiro pode visualizar lançamentos" ON public.lancamentos_financeiros_v2;
CREATE POLICY "users_can_view_church_finances" ON public.lancamentos_financeiros_v2
  FOR SELECT USING (can_access_church(church_id) OR is_super_admin());

DROP POLICY IF EXISTS "Tesoureiro pode inserir lançamentos" ON public.lancamentos_financeiros_v2;
CREATE POLICY "users_can_create_church_finances" ON public.lancamentos_financeiros_v2
  FOR INSERT WITH CHECK (can_access_church(church_id) OR is_super_admin());

DROP POLICY IF EXISTS "Tesoureiro pode atualizar lançamentos próprios" ON public.lancamentos_financeiros_v2;
CREATE POLICY "users_can_update_church_finances" ON public.lancamentos_financeiros_v2
  FOR UPDATE USING (can_access_church(church_id) OR is_super_admin());

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_churches()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_churches_updated_at
  BEFORE UPDATE ON public.churches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_churches();

CREATE TRIGGER update_user_church_roles_updated_at
  BEFORE UPDATE ON public.user_church_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_churches();