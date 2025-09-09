-- Create table for system configurations
CREATE TABLE IF NOT EXISTS public.system_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read; authenticated users can write (keep simple for now)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_configurations' AND policyname = 'Authenticated users can view configurations'
  ) THEN
    CREATE POLICY "Authenticated users can view configurations"
    ON public.system_configurations
    FOR SELECT
    USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_configurations' AND policyname = 'Authenticated users can manage configurations'
  ) THEN
    CREATE POLICY "Authenticated users can manage configurations"
    ON public.system_configurations
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Timestamps trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_configurations_updated_at'
  ) THEN
    CREATE TRIGGER update_system_configurations_updated_at
      BEFORE UPDATE ON public.system_configurations
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Seed defaults only if table is empty
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.system_configurations LIMIT 1) THEN
    INSERT INTO public.system_configurations (config_key, config_value, description) VALUES
    ('church_settings', jsonb_build_object('nomeIgreja', 'Igreja Evangélica Kerigma', 'timezone', 'America/Sao_Paulo', 'idioma', 'pt-BR'), 'General church settings'),
    ('admin_profile', jsonb_build_object('nome', 'João Silva', 'email', 'joao@igreja.com', 'telefone', '(11) 99999-9999', 'cargo', 'Pastor'), 'Administrator profile settings'),
    ('notifications', jsonb_build_object('emailNotif', true, 'pushNotif', true, 'smsNotif', false), 'Notification preferences'),
    ('security', jsonb_build_object('twoFactor', false, 'sessaoExpira', '24h'), 'Security settings'),
    ('appearance', jsonb_build_object('tema', 'auto', 'corPrimaria', '#3b82f6'), 'Appearance settings'),
    ('system', jsonb_build_object('backup', true, 'manutencao', false), 'System settings');
  END IF;
END $$;
