-- Events & Registrations foundation
-- 1) Extend eventos; 2) Create evento_tickets and evento_inscricoes; 3) Indexes, triggers, and RLS policies

-- Create enum for payment status if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'status_pagamento_evento'
  ) THEN
    CREATE TYPE public.status_pagamento_evento AS ENUM ('Pendente','Pago','Cancelado','Gratuito');
  END IF;
END$$;

-- Extend existing eventos table
ALTER TABLE public.eventos
  ADD COLUMN IF NOT EXISTS is_paid_event boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registration_deadline date,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS form_structure_json jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Ticket types per event
CREATE TABLE IF NOT EXISTS public.evento_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  nome text NOT NULL,
  preco numeric(12,2) NOT NULL DEFAULT 0,
  quantidade_total integer NOT NULL,
  quantidade_vendida integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Registrations per attendee
CREATE TABLE IF NOT EXISTS public.evento_inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  pessoa_id uuid REFERENCES public.pessoas(id) ON DELETE SET NULL,
  ticket_id uuid NOT NULL REFERENCES public.evento_tickets(id) ON DELETE RESTRICT,
  status_pagamento public.status_pagamento_evento NOT NULL DEFAULT 'Pendente',
  pagamento_valor numeric(12,2) DEFAULT 0,
  pagamento_moeda text DEFAULT 'BRL',
  qr_code_hash text NOT NULL UNIQUE,
  check_in_status boolean NOT NULL DEFAULT false,
  dados_formulario_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_evento_tickets_evento ON public.evento_tickets(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_inscricoes_evento ON public.evento_inscricoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_inscricoes_pessoa ON public.evento_inscricoes(pessoa_id);

-- Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_evento_tickets_updated_at'
  ) THEN
    CREATE TRIGGER update_evento_tickets_updated_at
    BEFORE UPDATE ON public.evento_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_evento_inscricoes_updated_at'
  ) THEN
    CREATE TRIGGER update_evento_inscricoes_updated_at
    BEFORE UPDATE ON public.evento_inscricoes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Enable RLS
ALTER TABLE public.evento_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_inscricoes ENABLE ROW LEVEL SECURITY;

-- Policies for evento_tickets
-- 1) Public can view tickets of public events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evento_tickets' AND policyname='publico_pode_ver_tickets_de_eventos_publicos'
  ) THEN
    CREATE POLICY "publico_pode_ver_tickets_de_eventos_publicos"
      ON public.evento_tickets
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.eventos e
          WHERE e.id = evento_tickets.evento_id AND e.publico = true
        )
      );
  END IF;
END$$;

-- 2) Admins/igreja can manage tickets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evento_tickets' AND policyname='admins_podem_gerenciar_tickets'
  ) THEN
    CREATE POLICY "admins_podem_gerenciar_tickets"
      ON public.evento_tickets
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.eventos e
          WHERE e.id = evento_tickets.evento_id
            AND (
              is_sede_admin() OR e.igreja_id = get_user_igreja_id() OR e.igreja_id = get_pastor_missao_igreja_id()
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.eventos e
          WHERE e.id = evento_tickets.evento_id
            AND (
              is_sede_admin() OR e.igreja_id = get_user_igreja_id() OR e.igreja_id = get_pastor_missao_igreja_id()
            )
        )
      );
  END IF;
END$$;

-- Policies for evento_inscricoes
-- 1) Users can view their own registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evento_inscricoes' AND policyname='usuario_ve_proprias_inscricoes'
  ) THEN
    CREATE POLICY "usuario_ve_proprias_inscricoes"
      ON public.evento_inscricoes
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.pessoas p WHERE p.id = evento_inscricoes.pessoa_id AND p.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- 2) Admins/igreja can view and manage all registrations for their events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evento_inscricoes' AND policyname='admins_gestores_ver_gerenciar_inscricoes'
  ) THEN
    CREATE POLICY "admins_gestores_ver_gerenciar_inscricoes"
      ON public.evento_inscricoes
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.eventos e
          WHERE e.id = evento_inscricoes.evento_id
            AND (
              is_sede_admin() OR e.igreja_id = get_user_igreja_id() OR e.igreja_id = get_pastor_missao_igreja_id()
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.eventos e
          WHERE e.id = evento_inscricoes.evento_id
            AND (
              is_sede_admin() OR e.igreja_id = get_user_igreja_id() OR e.igreja_id = get_pastor_missao_igreja_id()
            )
        )
      );
  END IF;
END$$;

-- 3) Logged-in users can create their own registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evento_inscricoes' AND policyname='usuario_pode_criar_propria_inscricao'
  ) THEN
    CREATE POLICY "usuario_pode_criar_propria_inscricao"
      ON public.evento_inscricoes
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.pessoas p WHERE p.id = evento_inscricoes.pessoa_id AND p.user_id = auth.uid()
        )
      );
  END IF;
END$$;