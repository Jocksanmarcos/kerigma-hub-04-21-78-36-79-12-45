-- Create table for storing Google OAuth tokens used by the google-calendar-sync edge function
-- Safe to run multiple times
CREATE TABLE IF NOT EXISTS public.google_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  scope TEXT,
  token_type TEXT,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (access will typically be via service role from the edge function)
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Optional: Allow users to view their own token metadata (not the token itself) - keep secure by default (no policy)
-- Policies can be added later if needed.

-- Trigger to keep updated_at in sync
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_google_oauth_tokens_updated_at'
  ) THEN
    CREATE TRIGGER trg_google_oauth_tokens_updated_at
    BEFORE UPDATE ON public.google_oauth_tokens
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;