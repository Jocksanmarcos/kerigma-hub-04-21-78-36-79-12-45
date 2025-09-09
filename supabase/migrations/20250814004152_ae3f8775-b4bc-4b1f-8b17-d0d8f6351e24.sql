-- Criar tabelas necessárias para sistema de notificações e backup

-- Tabela para notificações dos usuários
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('event', 'teaching', 'cell', 'system')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON public.user_notifications(read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);

-- RLS para notificações
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias notificações"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir notificações"
  ON public.user_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas próprias notificações"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabela para configurações de notificação dos usuários
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  events BOOLEAN NOT NULL DEFAULT true,
  teaching_content BOOLEAN NOT NULL DEFAULT true,
  cell_messages BOOLEAN NOT NULL DEFAULT true,
  email BOOLEAN NOT NULL DEFAULT true,
  push BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para configurações de notificação
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas próprias configurações"
  ON public.user_notification_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabela para backups do sistema
CREATE TABLE IF NOT EXISTS public.system_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'manual' CHECK (type IN ('automatic', 'manual')),
  size BIGINT NOT NULL DEFAULT 0,
  tables_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed')),
  backup_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para backups
CREATE INDEX IF NOT EXISTS idx_system_backups_created_at ON public.system_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_backups_status ON public.system_backups(status);

-- RLS para backups (apenas admins)
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem gerenciar backups"
  ON public.system_backups FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_user_notifications_updated_at ON public.user_notifications;
CREATE TRIGGER update_user_notifications_updated_at
  BEFORE UPDATE ON public.user_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notification_settings_updated_at ON public.user_notification_settings;
CREATE TRIGGER update_user_notification_settings_updated_at
  BEFORE UPDATE ON public.user_notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_backups_updated_at ON public.system_backups;
CREATE TRIGGER update_system_backups_updated_at
  BEFORE UPDATE ON public.system_backups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();