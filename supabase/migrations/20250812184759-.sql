-- Remover coluna google_calendar_event_id da tabela agendamentos
ALTER TABLE public.agendamentos DROP COLUMN IF EXISTS google_calendar_event_id;

-- Remover tabela google_oauth_tokens se existir
DROP TABLE IF EXISTS public.google_oauth_tokens;