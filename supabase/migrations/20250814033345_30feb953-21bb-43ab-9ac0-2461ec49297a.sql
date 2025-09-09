-- Criar tabelas se não existirem
CREATE TABLE IF NOT EXISTS public.push_notification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'web',
  device_info JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  eventos_proximos BOOLEAN DEFAULT true,
  novos_conteudos_ensino BOOLEAN DEFAULT true,
  lembretes_celula BOOLEAN DEFAULT true,
  lembretes_financeiro BOOLEAN DEFAULT false,
  horario_preferido TIME DEFAULT '09:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  delivery_attempt INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.backup_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  backup_size_mb DECIMAL,
  backup_location TEXT,
  tables_included TEXT[],
  error_message TEXT,
  created_by UUID,
  metadata JSONB DEFAULT '{}'
);

-- Habilitar RLS apenas se ainda não estiver habilitado
DO $$
BEGIN
  ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.backup_jobs ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Função para limpar tokens expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.push_notification_tokens 
  WHERE updated_at < (now() - INTERVAL '30 days')
    AND active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;