-- ===============================================
-- CENTRO DE GOVERNANÇA DE ACESSO - ESTRUTURA COMPLETA (CORRIGIDA)
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

-- ETAPA 7: Inserir permissões básicas (SEM campo description)
INSERT INTO public.permissions (action, subject) VALUES
  ('read', 'pessoas'),
  ('create', 'pessoas'),
  ('update', 'pessoas'),
  ('delete', 'pessoas'),
  ('manage', 'pessoas'),
  
  ('read', 'celulas'),
  ('create', 'celulas'),
  ('update', 'celulas'),
  ('delete', 'celulas'),
  ('manage', 'celulas'),
  
  ('read', 'financeiro'),
  ('create', 'financeiro'),
  ('update', 'financeiro'),
  ('delete', 'financeiro'),
  ('manage', 'financeiro'),
  
  ('read', 'relatorios'),
  ('create', 'relatorios'),
  ('manage', 'sistema'),
  ('manage', 'all')
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