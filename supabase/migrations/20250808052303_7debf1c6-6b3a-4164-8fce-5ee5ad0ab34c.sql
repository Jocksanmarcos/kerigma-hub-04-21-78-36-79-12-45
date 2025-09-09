-- Enable Gestão de Pessoas: base de perfis, permissões e eventos de segurança
-- 1) Tabela de perfis de acesso
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level INT NOT NULL DEFAULT 1,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: leitura por usuários autenticados
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Profiles are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Profiles are viewable by authenticated users"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 2) Tabela de permissões granulares
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  subject TEXT NOT NULL,
  resource_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='permissions' AND policyname='Permissions are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Permissions are viewable by authenticated users"
      ON public.permissions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 3) Relação de permissões por perfil
CREATE TABLE IF NOT EXISTS public.profile_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (profile_id, permission_id)
);

ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profile_permissions' AND policyname='Profile permissions are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Profile permissions are viewable by authenticated users"
      ON public.profile_permissions
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 4) Eventos de segurança por usuário (usado em PessoaSeguranca)
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Usuários veem seus próprios eventos
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='security_events' AND policyname='Users can read their own security events'
  ) THEN
    CREATE POLICY "Users can read their own security events"
      ON public.security_events
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5) Índices para performance
CREATE INDEX IF NOT EXISTS idx_profile_permissions_profile ON public.profile_permissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_permissions_permission ON public.profile_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_subject_action ON public.permissions(subject, action);

-- 6) Seeds mínimos (idempotentes)
INSERT INTO public.profiles (name, level, description)
VALUES
  ('Administrador', 4, 'Acesso total ao sistema'),
  ('Líder', 3, 'Gestão de células e pessoas sob sua liderança'),
  ('Membro', 2, 'Acesso aos próprios dados e participação'),
  ('Visitante', 1, 'Acesso básico')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (action, subject, resource_type)
VALUES
  ('view', 'pessoas', 'people'),
  ('edit', 'pessoas', 'people'),
  ('create', 'pessoas', 'people'),
  ('delete', 'pessoas', 'people'),
  ('manage', 'perfis', 'security')
ON CONFLICT DO NOTHING;

-- Vincular permissões padrão para Administrador (todas) e Líder (view/edit)
DO $$
DECLARE admin_id UUID; leader_id UUID; perm RECORD;
BEGIN
  SELECT id INTO admin_id FROM public.profiles WHERE name='Administrador';
  SELECT id INTO leader_id FROM public.profiles WHERE name='Líder';

  FOR perm IN SELECT id, action, subject FROM public.permissions LOOP
    -- Admin: tudo
    INSERT INTO public.profile_permissions(profile_id, permission_id, granted)
    VALUES (admin_id, perm.id, true)
    ON CONFLICT (profile_id, permission_id) DO NOTHING;

    -- Líder: apenas view/edit de pessoas
    IF perm.subject='pessoas' AND perm.action IN ('view','edit') THEN
      INSERT INTO public.profile_permissions(profile_id, permission_id, granted)
      VALUES (leader_id, perm.id, true)
      ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 7) Opcional: garantir colunas base em pessoas para integração (não cria se já existir)
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS profile_id UUID;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS user_id UUID;

-- Tentar criar relacionamento para nested selects de profiles (ignora se já existir)
DO $$ BEGIN
  IF to_regclass('public.pessoas') IS NOT NULL AND to_regclass('public.profiles') IS NOT NULL THEN
    BEGIN
      ALTER TABLE public.pessoas
        ADD CONSTRAINT pessoas_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;