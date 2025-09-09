-- Create the Volunteer Hub database structure

-- 1. Add new columns to existing tables
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS disponibilidade_json JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferencias_servico TEXT;

-- 2. Create ministerios_vagas table
CREATE TABLE IF NOT EXISTS public.ministerios_vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministerio_id UUID REFERENCES public.ministerios(id) ON DELETE CASCADE,
  titulo_vaga TEXT NOT NULL,
  descricao TEXT,
  dons_necessarios TEXT[],
  requisitos JSONB DEFAULT '{}',
  status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'preenchida', 'pausada')),
  vagas_totais INTEGER DEFAULT 1,
  vagas_preenchidas INTEGER DEFAULT 0,
  data_limite DATE,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create voluntarios_candidaturas table
CREATE TABLE IF NOT EXISTS public.voluntarios_candidaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
  vaga_id UUID REFERENCES public.ministerios_vagas(id) ON DELETE CASCADE,
  status_candidatura TEXT DEFAULT 'pendente' CHECK (status_candidatura IN ('pendente', 'aprovada', 'recusada', 'em_analise')),
  mensagem_candidato TEXT,
  observacoes_lider TEXT,
  data_candidatura TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_resposta TIMESTAMP WITH TIME ZONE,
  avaliado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(membro_id, vaga_id)
);

-- 4. Refactor escalas tables to be more generic
ALTER TABLE public.escalas_eventos 
ADD COLUMN IF NOT EXISTS ministerio_id UUID REFERENCES public.ministerios(id);

ALTER TABLE public.escalas_membros 
ADD COLUMN IF NOT EXISTS ministerio_id UUID REFERENCES public.ministerios(id);

-- 5. Create availability management table
CREATE TABLE IF NOT EXISTS public.disponibilidade_voluntarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  disponivel BOOLEAN DEFAULT true,
  observacoes TEXT,
  tipo_indisponibilidade TEXT CHECK (tipo_indisponibilidade IN ('viagem', 'trabalho', 'saude', 'familia', 'outros')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create volunteer skills/talents table
CREATE TABLE IF NOT EXISTS public.voluntarios_habilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
  habilidade TEXT NOT NULL,
  nivel_experiencia TEXT DEFAULT 'iniciante' CHECK (nivel_experiencia IN ('iniciante', 'intermediario', 'avancado', 'expert')),
  certificado BOOLEAN DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pessoa_id, habilidade)
);

-- Enable RLS on new tables
ALTER TABLE public.ministerios_vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voluntarios_candidaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidade_voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voluntarios_habilidades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ministerios_vagas
CREATE POLICY "Admins e líderes podem gerenciar vagas de ministério"
ON public.ministerios_vagas
FOR ALL
USING (is_admin() OR EXISTS (
  SELECT 1 FROM public.ministerios m 
  WHERE m.id = ministerios_vagas.ministerio_id 
  AND m.lider_id = get_current_person_id()
));

CREATE POLICY "Membros podem ver vagas ativas"
ON public.ministerios_vagas
FOR SELECT
USING (status = 'aberta');

-- RLS Policies for voluntarios_candidaturas
CREATE POLICY "Admins e líderes podem gerenciar candidaturas"
ON public.voluntarios_candidaturas
FOR ALL
USING (is_admin() OR EXISTS (
  SELECT 1 FROM public.ministerios_vagas mv 
  JOIN public.ministerios m ON m.id = mv.ministerio_id
  WHERE mv.id = voluntarios_candidaturas.vaga_id 
  AND m.lider_id = get_current_person_id()
));

CREATE POLICY "Membros podem ver próprias candidaturas"
ON public.voluntarios_candidaturas
FOR SELECT
USING (membro_id = get_current_person_id());

CREATE POLICY "Membros podem criar candidaturas"
ON public.voluntarios_candidaturas
FOR INSERT
WITH CHECK (membro_id = get_current_person_id());

-- RLS Policies for disponibilidade_voluntarios
CREATE POLICY "Usuários podem gerenciar própria disponibilidade"
ON public.disponibilidade_voluntarios
FOR ALL
USING (pessoa_id = get_current_person_id());

CREATE POLICY "Líderes podem ver disponibilidade da equipe"
ON public.disponibilidade_voluntarios
FOR SELECT
USING (is_admin() OR EXISTS (
  SELECT 1 FROM public.ministerios m 
  WHERE m.lider_id = get_current_person_id()
));

-- RLS Policies for voluntarios_habilidades
CREATE POLICY "Usuários podem gerenciar próprias habilidades"
ON public.voluntarios_habilidades
FOR ALL
USING (pessoa_id = get_current_person_id());

CREATE POLICY "Admins e líderes podem ver habilidades"
ON public.voluntarios_habilidades
FOR SELECT
USING (is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ministerios_vagas_status ON public.ministerios_vagas(status);
CREATE INDEX IF NOT EXISTS idx_ministerios_vagas_ministerio ON public.ministerios_vagas(ministerio_id);
CREATE INDEX IF NOT EXISTS idx_voluntarios_candidaturas_membro ON public.voluntarios_candidaturas(membro_id);
CREATE INDEX IF NOT EXISTS idx_voluntarios_candidaturas_vaga ON public.voluntarios_candidaturas(vaga_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidade_voluntarios_pessoa ON public.disponibilidade_voluntarios(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidade_voluntarios_periodo ON public.disponibilidade_voluntarios(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_voluntarios_habilidades_pessoa ON public.voluntarios_habilidades(pessoa_id);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_volunteer()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ministerios_vagas_updated_at
  BEFORE UPDATE ON public.ministerios_vagas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_volunteer();

CREATE TRIGGER update_voluntarios_candidaturas_updated_at
  BEFORE UPDATE ON public.voluntarios_candidaturas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_volunteer();

CREATE TRIGGER update_disponibilidade_voluntarios_updated_at
  BEFORE UPDATE ON public.disponibilidade_voluntarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_volunteer();