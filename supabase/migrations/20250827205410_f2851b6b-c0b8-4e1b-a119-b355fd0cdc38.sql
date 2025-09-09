-- Fix missing RPC functions - avoid recreating existing triggers

-- Ensure get_user_church_id returns null instead of hardcoded UUID for better compatibility
CREATE OR REPLACE FUNCTION get_user_church_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
  
  RETURN result_church_id; -- Return NULL instead of hardcoded UUID
END;
$$;

-- Ensure basic tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.igrejas (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    tipo text DEFAULT 'sede' CHECK (tipo IN ('sede', 'missao')),
    endereco text,
    email text,
    telefone text,
    cidade text,
    estado text,
    pastor_responsavel text,
    data_fundacao date,
    ativa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Ensure user_church_roles table exists
CREATE TABLE IF NOT EXISTS public.user_church_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    church_id uuid REFERENCES public.igrejas(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('super_admin', 'pastor', 'tesoureiro', 'lider_celula', 'secretario', 'membro')),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, church_id)
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'igrejas' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.igrejas ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'user_church_roles' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.user_church_roles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;