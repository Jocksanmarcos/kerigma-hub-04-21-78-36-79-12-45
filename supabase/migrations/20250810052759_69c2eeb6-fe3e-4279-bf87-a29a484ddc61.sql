-- 1) Create enum for roles (safe if exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- 2) Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) Role-check function (SECURITY DEFINER, STABLE)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

-- 4) RLS policies
-- View own roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view own roles'
  ) THEN
    CREATE POLICY "Users can view own roles"
      ON public.user_roles
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Admins can view all roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can view all roles'
  ) THEN
    CREATE POLICY "Admins can view all roles"
      ON public.user_roles
      FOR SELECT
      USING (
        public.is_sede_admin() OR public.has_role(auth.uid(), 'admin'::public.app_role)
      );
  END IF;
END $$;

-- Admins manage roles (insert/update/delete)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins manage roles'
  ) THEN
    CREATE POLICY "Admins manage roles"
      ON public.user_roles
      FOR ALL
      USING (
        public.is_sede_admin() OR public.has_role(auth.uid(), 'admin'::public.app_role)
      )
      WITH CHECK (
        public.is_sede_admin() OR public.has_role(auth.uid(), 'admin'::public.app_role)
      );
  END IF;
END $$;

-- Optional helpful index for querying by user_id
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);