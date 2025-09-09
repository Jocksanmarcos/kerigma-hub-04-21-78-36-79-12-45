-- Unified Ministries: invites + codes
-- 1) Add codigo_convite to equipas_ministeriais
ALTER TABLE public.equipas_ministeriais ADD COLUMN IF NOT EXISTS codigo_convite text UNIQUE;

-- 2) Ensure unique token for convites_ministerio
CREATE UNIQUE INDEX IF NOT EXISTS idx_convites_ministerio_token_unique ON public.convites_ministerio (token_convite);

-- 3) Helper to generate random invite code
CREATE OR REPLACE FUNCTION public.generate_random_code(p_length int DEFAULT 8)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..p_length LOOP
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 4) Seed codes for existing ministries/teams
UPDATE public.equipas_ministeriais 
SET codigo_convite = generate_random_code(8)
WHERE codigo_convite IS NULL;

-- 5) Rotate code function (leader-only)
CREATE OR REPLACE FUNCTION public.rotate_ministry_code(p_ministerio_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.equipas_ministeriais em 
    WHERE em.id = p_ministerio_id AND em.lider_id = get_current_person_id()
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  LOOP
    new_code := generate_random_code(8);
    BEGIN
      UPDATE public.equipas_ministeriais SET codigo_convite = new_code WHERE id = p_ministerio_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- retry with another code
    END;
  END LOOP;
  RETURN new_code;
END;
$$;

-- 6) Create ministry invite (leader-only)
CREATE OR REPLACE FUNCTION public.create_ministry_invite(p_ministerio_id uuid, p_email text, p_funcoes uuid[] DEFAULT NULL)
RETURNS TABLE(id uuid, token_convite text, data_expiracao timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.equipas_ministeriais em 
    WHERE em.id = p_ministerio_id AND em.lider_id = get_current_person_id()
  ) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_token := encode(gen_random_bytes(12), 'hex');

  INSERT INTO public.convites_ministerio (ministerio_id, email_convidado, funcoes_sugeridas, token_convite)
  VALUES (p_ministerio_id, p_email, p_funcoes, v_token)
  RETURNING id, token_convite, data_expiracao INTO id, token_convite, data_expiracao;

  RETURN;
END;
$$;

-- 7) Validate invite token (public via RPC, but no sensitive data)
CREATE OR REPLACE FUNCTION public.validate_ministry_invite(p_token text)
RETURNS TABLE(ministerio_id uuid, ministerio_nome text, email_convidado text, funcoes_sugeridas uuid[], expirado boolean, usado boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.ministerio_id,
    COALESCE(em.nome_equipa, 'Ministério') as ministerio_nome,
    c.email_convidado,
    c.funcoes_sugeridas,
    (now() > c.data_expiracao) as expirado,
    c.usado
  FROM public.convites_ministerio c
  LEFT JOIN public.equipas_ministeriais em ON em.id = c.ministerio_id
  WHERE c.token_convite = p_token
  LIMIT 1;
END;
$$;

-- 8) Accept invite and enroll member in selected functions
CREATE OR REPLACE FUNCTION public.accept_ministry_invite(p_token text, p_selected_funcoes uuid[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invite record;
  v_pessoa_id uuid;
  v_func uuid;
BEGIN
  SELECT * INTO v_invite FROM public.convites_ministerio WHERE token_convite = p_token FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Convite inválido'; END IF;
  IF v_invite.usado THEN RAISE EXCEPTION 'Convite já utilizado'; END IF;
  IF now() > v_invite.data_expiracao THEN RAISE EXCEPTION 'Convite expirado'; END IF;

  v_pessoa_id := get_current_person_id();
  IF v_pessoa_id IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado'; END IF;

  IF p_selected_funcoes IS NOT NULL AND array_length(p_selected_funcoes,1) > 0 THEN
    FOREACH v_func IN ARRAY p_selected_funcoes LOOP
      IF EXISTS (
        SELECT 1 FROM public.funcoes_equipa fe WHERE fe.id = v_func AND fe.equipa_id = v_invite.ministerio_id
      ) THEN
        INSERT INTO public.membros_equipa (pessoa_id, funcao_id, nivel_competencia, disponibilidade_semanal, ativo)
        VALUES (v_pessoa_id, v_func, 'iniciante', ARRAY[]::text[], true)
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  UPDATE public.convites_ministerio SET usado = true, usado_em = now() WHERE id = v_invite.id;
  RETURN true;
END;
$$;

-- 9) Enable RLS on convites_ministerio and add leader policy
ALTER TABLE public.convites_ministerio ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='convites_ministerio' AND policyname='Leaders manage convites_ministerio'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Leaders manage convites_ministerio"
      ON public.convites_ministerio
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.equipas_ministeriais em
          WHERE em.id = convites_ministerio.ministerio_id
            AND em.lider_id = get_current_person_id()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.equipas_ministeriais em
          WHERE em.id = convites_ministerio.ministerio_id
            AND em.lider_id = get_current_person_id()
        )
      );
    $$;
  END IF;
END$$;