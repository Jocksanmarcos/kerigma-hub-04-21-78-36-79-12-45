-- Create table for sound ambience presets
CREATE TABLE public.louvor_presets_ambiente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_preset TEXT NOT NULL,
  tonalidade_base TEXT,
  bpm INTEGER,
  volume_pad INTEGER NOT NULL DEFAULT 50,
  volume_pratos INTEGER NOT NULL DEFAULT 50,
  volume_bumbo INTEGER NOT NULL DEFAULT 50,
  volume_vocoder INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT volume_pad_range CHECK (volume_pad >= 0 AND volume_pad <= 100),
  CONSTRAINT volume_pratos_range CHECK (volume_pratos >= 0 AND volume_pratos <= 100),
  CONSTRAINT volume_bumbo_range CHECK (volume_bumbo >= 0 AND volume_bumbo <= 100),
  CONSTRAINT volume_vocoder_range CHECK (volume_vocoder >= 0 AND volume_vocoder <= 100)
);

-- Enable RLS and policies
ALTER TABLE public.louvor_presets_ambiente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manage louvor presets (leaders/admin)"
ON public.louvor_presets_ambiente
AS PERMISSIVE
FOR ALL
TO authenticated
USING (is_admin() OR user_has_permission('manage', 'cultos'))
WITH CHECK (is_admin() OR user_has_permission('manage', 'cultos'));

CREATE POLICY "read louvor presets (worship readers)"
ON public.louvor_presets_ambiente
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_admin() OR user_has_permission('read', 'cultos') OR user_has_permission('manage', 'cultos'));

-- Trigger to keep updated_at fresh
CREATE TRIGGER trg_louvor_presets_ambiente_updated_at
BEFORE UPDATE ON public.louvor_presets_ambiente
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Link table: setlist item -> preset
CREATE TABLE public.culto_setlist_presets (
  setlist_item_id UUID PRIMARY KEY REFERENCES public.culto_setlist(id) ON DELETE CASCADE,
  preset_id UUID NOT NULL REFERENCES public.louvor_presets_ambiente(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.culto_setlist_presets ENABLE ROW LEVEL SECURITY;

-- Manage rights follow service planning manage rights
CREATE POLICY "manage setlist presets (leaders/admin)"
ON public.culto_setlist_presets
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  (is_admin() OR user_has_permission('manage', 'cultos')) AND 
  EXISTS (
    SELECT 1 FROM public.culto_setlist cs
    WHERE cs.id = culto_setlist_presets.setlist_item_id
  )
)
WITH CHECK (
  (is_admin() OR user_has_permission('manage', 'cultos')) AND 
  EXISTS (
    SELECT 1 FROM public.culto_setlist cs
    WHERE cs.id = culto_setlist_presets.setlist_item_id
  )
);

-- Read policy allows worship readers
CREATE POLICY "read setlist presets (worship readers)"
ON public.culto_setlist_presets
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  (is_admin() OR user_has_permission('read', 'cultos') OR user_has_permission('manage', 'cultos')) AND 
  EXISTS (
    SELECT 1 FROM public.culto_setlist cs
    WHERE cs.id = culto_setlist_presets.setlist_item_id
  )
);
