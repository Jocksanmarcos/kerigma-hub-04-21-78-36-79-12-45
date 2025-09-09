-- ===============================================
-- CENTRO DE GOVERNANÇA DE ACESSO - ESTRUTURA COMPLETA
-- ===============================================

-- ETAPA 1: Criar tabelas para o sistema de permissões RBAC/ABAC
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 1, -- 1=básico, 5=admin total
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- create, read, update, delete, manage
  subject TEXT NOT NULL, -- pessoas, celulas, financeiro, etc
  resource_type TEXT, -- para ABAC: próprio, célula, congregação
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profile_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB DEFAULT '{}', -- Para ABAC: condições especiais
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, permission_id)
);

-- ETAPA 2: Atualizar tabela pessoas para incluir profile_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pessoas' AND column_name = 'profile_id') THEN
    ALTER TABLE public.pessoas ADD COLUMN profile_id UUID REFERENCES public.profiles(id);
  END IF;
END $$;

-- ETAPA 3: Sistema de auditoria completo
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc
  resource_type TEXT NOT NULL, -- tabela ou módulo afetado
  resource_id UUID, -- ID do registro afetado
  old_values JSONB, -- valores antes da mudança
  new_values JSONB, -- valores após a mudança
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ETAPA 4: Tabela para sessões ativas e controle MFA
CREATE TABLE IF NOT EXISTS public.security_active_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  mfa_verified BOOLEAN NOT NULL DEFAULT false,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ETAPA 5: Eventos de segurança para monitoramento
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL, -- login_success, login_failed, password_change, etc
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  location_data JSONB DEFAULT '{}', -- geolocalização se disponível
  risk_score INTEGER DEFAULT 0, -- 0-100, calculado automaticamente
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ETAPA 6: Inserir perfis padrão
INSERT INTO public.profiles (name, description, level) VALUES
  ('Membro', 'Membro comum da igreja', 1),
  ('Líder de Célula', 'Líder responsável por uma célula', 2),
  ('Pastor', 'Pastor de congregação', 3),
  ('Pastor Sênior', 'Pastor sênior da igreja', 4),
  ('Admin', 'Administrador do sistema', 5)
ON CONFLICT (name) DO NOTHING;

-- ETAPA 7: Inserir permissões básicas
INSERT INTO public.permissions (action, subject, description) VALUES
  ('read', 'pessoas', 'Ver pessoas'),
  ('create', 'pessoas', 'Criar pessoas'),
  ('update', 'pessoas', 'Editar pessoas'),
  ('delete', 'pessoas', 'Excluir pessoas'),
  ('manage', 'pessoas', 'Gerenciar pessoas completamente'),
  
  ('read', 'celulas', 'Ver células'),
  ('create', 'celulas', 'Criar células'),
  ('update', 'celulas', 'Editar células'),
  ('delete', 'celulas', 'Excluir células'),
  ('manage', 'celulas', 'Gerenciar células completamente'),
  
  ('read', 'financeiro', 'Ver dados financeiros'),
  ('create', 'financeiro', 'Criar lançamentos financeiros'),
  ('update', 'financeiro', 'Editar lançamentos financeiros'),
  ('delete', 'financeiro', 'Excluir lançamentos financeiros'),
  ('manage', 'financeiro', 'Gerenciar finanças completamente'),
  
  ('read', 'relatorios', 'Ver relatórios'),
  ('create', 'relatorios', 'Criar relatórios'),
  ('manage', 'sistema', 'Gerenciar sistema'),
  ('manage', 'all', 'Acesso total ao sistema')
ON CONFLICT DO NOTHING;

-- ETAPA 8: Configurar permissões por perfil
DO $$
DECLARE
  membro_id UUID;
  lider_id UUID;
  pastor_id UUID;
  pastor_senior_id UUID;
  admin_id UUID;
  perm_id UUID;
BEGIN
  -- Buscar IDs dos perfis
  SELECT id INTO membro_id FROM public.profiles WHERE name = 'Membro';
  SELECT id INTO lider_id FROM public.profiles WHERE name = 'Líder de Célula';
  SELECT id INTO pastor_id FROM public.profiles WHERE name = 'Pastor';
  SELECT id INTO pastor_senior_id FROM public.profiles WHERE name = 'Pastor Sênior';
  SELECT id INTO admin_id FROM public.profiles WHERE name = 'Admin';
  
  -- Permissões para Membro (apenas visualizar seus próprios dados)
  FOR perm_id IN SELECT id FROM public.permissions WHERE action = 'read' AND subject IN ('pessoas') LOOP
    INSERT INTO public.profile_permissions (profile_id, permission_id, conditions) 
    VALUES (membro_id, perm_id, '{"scope": "own"}') ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Permissões para Líder de Célula
  FOR perm_id IN SELECT id FROM public.permissions WHERE subject IN ('pessoas', 'celulas') AND action IN ('read', 'update') LOOP
    INSERT INTO public.profile_permissions (profile_id, permission_id, conditions) 
    VALUES (lider_id, perm_id, '{"scope": "cell"}') ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Permissões para Pastor
  FOR perm_id IN SELECT id FROM public.permissions WHERE subject IN ('pessoas', 'celulas', 'relatorios') LOOP
    INSERT INTO public.profile_permissions (profile_id, permission_id, conditions) 
    VALUES (pastor_id, perm_id, '{"scope": "congregation"}') ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Permissões para Pastor Sênior
  FOR perm_id IN SELECT id FROM public.permissions WHERE subject != 'sistema' LOOP
    INSERT INTO public.profile_permissions (profile_id, permission_id) 
    VALUES (pastor_senior_id, perm_id) ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Permissões para Admin (acesso total)
  FOR perm_id IN SELECT id FROM public.permissions LOOP
    INSERT INTO public.profile_permissions (profile_id, permission_id) 
    VALUES (admin_id, perm_id) ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ETAPA 9: Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- ETAPA 10: Políticas RLS para sistema de perfis (apenas admins podem gerenciar)
CREATE POLICY "Qualquer um pode ver perfis ativos" ON public.profiles
  FOR SELECT USING (active = true);

CREATE POLICY "Apenas admins podem gerenciar perfis" ON public.profiles
  FOR ALL USING (is_admin());

CREATE POLICY "Qualquer um pode ver permissões" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar permissões" ON public.permissions
  FOR ALL USING (is_admin());

CREATE POLICY "Qualquer um pode ver profile_permissions" ON public.profile_permissions
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar profile_permissions" ON public.profile_permissions
  FOR ALL USING (is_admin());

-- ETAPA 11: Políticas RLS para auditoria
CREATE POLICY "Apenas admins podem ver logs de auditoria" ON public.security_audit_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "Sistema pode inserir logs de auditoria" ON public.security_audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem gerenciar próprias sessões" ON public.security_active_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins podem ver todas as sessões" ON public.security_active_sessions
  FOR SELECT USING (is_admin());

CREATE POLICY "Apenas admins podem ver eventos de segurança" ON public.security_events
  FOR SELECT USING (is_admin());

CREATE POLICY "Sistema pode inserir eventos de segurança" ON public.security_events
  FOR INSERT WITH CHECK (true);

-- ETAPA 12: Triggers para auditoria automática
CREATE OR REPLACE FUNCTION public.auto_audit_trigger()
RETURNS TRIGGER AS $$
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
  INSERT INTO public.security_audit_logs (
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ETAPA 13: Aplicar triggers de auditoria nas tabelas importantes
DROP TRIGGER IF EXISTS audit_pessoas_trigger ON public.pessoas;
CREATE TRIGGER audit_pessoas_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pessoas
  FOR EACH ROW EXECUTE FUNCTION public.auto_audit_trigger();

DROP TRIGGER IF EXISTS audit_celulas_trigger ON public.celulas;
CREATE TRIGGER audit_celulas_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.celulas
  FOR EACH ROW EXECUTE FUNCTION public.auto_audit_trigger();

-- ETAPA 14: Funções auxiliares para verificação de permissões
CREATE OR REPLACE FUNCTION public.user_has_permission(action_name TEXT, subject_name TEXT, resource_type_param TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.pessoas pe
    JOIN public.profile_permissions pp ON pe.profile_id = pp.profile_id
    JOIN public.permissions p ON pp.permission_id = p.id
    WHERE pe.user_id = auth.uid()
    AND pp.granted = true
    AND p.action = action_name
    AND p.subject = subject_name
    AND (resource_type_param IS NULL OR p.resource_type = resource_type_param)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.user_has_permission('manage', 'all');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.pessoas 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ETAPA 15: Triggers para manter updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ETAPA 16: Função para criar usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_profile_id UUID;
BEGIN
  -- Buscar o ID do profile "Membro" (perfil padrão)
  SELECT id INTO default_profile_id
  FROM public.profiles 
  WHERE name = 'Membro' 
  LIMIT 1;

  -- Inserir novo registro em pessoas quando usuário se registra
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
    -- Se já existe, apenas retorna
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log erro mas não falha o processo de registro
    RAISE WARNING 'Erro ao criar perfil de pessoa: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar pessoa automaticamente no registro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();