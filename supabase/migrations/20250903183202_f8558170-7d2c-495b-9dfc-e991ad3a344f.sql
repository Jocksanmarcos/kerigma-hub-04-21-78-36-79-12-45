-- Criar agendamento automático para notificações de aniversário
-- Executa todos os dias às 09:00
SELECT cron.schedule(
  'birthday-notifications-daily',
  '0 9 * * *', -- Todos os dias às 09:00
  $$
  SELECT
    net.http_post(
      url := 'https://vsanvmekqtfkbgmrjwoo.supabase.co/functions/v1/birthday-notifications',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);