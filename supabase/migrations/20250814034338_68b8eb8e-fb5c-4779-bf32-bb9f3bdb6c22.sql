-- Criar políticas RLS (apenas as que não existem)
DO $$
BEGIN
  -- Políticas para push_notification_tokens
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'push_notification_tokens' 
    AND policyname = 'users_manage_tokens'
  ) THEN
    CREATE POLICY "users_manage_tokens"
      ON public.push_notification_tokens
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Políticas para notification_preferences
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notification_preferences' 
    AND policyname = 'users_manage_preferences'
  ) THEN
    CREATE POLICY "users_manage_preferences"
      ON public.notification_preferences
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Políticas para notifications_log
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications_log' 
    AND policyname = 'users_view_log'
  ) THEN
    CREATE POLICY "users_view_log"
      ON public.notifications_log
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications_log' 
    AND policyname = 'system_insert_log'
  ) THEN
    CREATE POLICY "system_insert_log"
      ON public.notifications_log
      FOR INSERT
      WITH CHECK (true);
  END IF;

  -- Políticas para backup_jobs
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'backup_jobs' 
    AND policyname = 'admins_manage_backups'
  ) THEN
    CREATE POLICY "admins_manage_backups"
      ON public.backup_jobs
      FOR ALL
      USING (is_security_admin())
      WITH CHECK (is_security_admin());
  END IF;
END $$;

-- Criar triggers para updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_push_notification_tokens_updated_at'
  ) THEN
    CREATE TRIGGER update_push_notification_tokens_updated_at
      BEFORE UPDATE ON public.push_notification_tokens
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_notification_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_notification_preferences_updated_at
      BEFORE UPDATE ON public.notification_preferences
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;