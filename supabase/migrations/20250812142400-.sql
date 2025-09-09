-- Configurar execução automática da IA Pastoral
-- Criar cron job para executar a IA todos os dias às 06:00
SELECT cron.schedule(
  'pastoral-ai-daily-check',
  '0 6 * * *', -- Todos os dias às 06:00
  $$
  SELECT
    net.http_post(
        url:='https://vsanvmekqtfkbgmrjwoo.supabase.co/functions/v1/pastoral-ai-inactivity-detector',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYW52bWVrcXRma2JnbXJqd29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjU0OTUsImV4cCI6MjA2OTEwMTQ5NX0.eJqJcO-lOng2-1OwMhXAOXTYRF1hAsRo7NrkFT34ob8"}'::jsonb,
        body:=concat('{"trigger": "cron", "timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);