-- Create calendarios table
CREATE TABLE public.calendarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  proprietario_id UUID REFERENCES public.pessoas(id),
  visivel_para_todos BOOLEAN NOT NULL DEFAULT false,
  tipo TEXT NOT NULL DEFAULT 'pessoal' CHECK (tipo IN ('pessoal', 'ministerio', 'publico')),
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agendamentos table  
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendario_id UUID NOT NULL REFERENCES public.calendarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  responsavel_id UUID REFERENCES public.pessoas(id),
  local TEXT,
  google_calendar_event_id TEXT,
  recorrente BOOLEAN NOT NULL DEFAULT false,
  recorrencia_config JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'tentativo', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agendamento_participantes table
CREATE TABLE public.agendamento_participantes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  status TEXT NOT NULL DEFAULT 'convidado' CHECK (status IN ('convidado', 'confirmado', 'rejeitado')),
  papel TEXT DEFAULT 'participante' CHECK (papel IN ('organizador', 'participante', 'colaborador')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agendamento_id, pessoa_id)
);

-- Create agendamento_recursos table
CREATE TABLE public.agendamento_recursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  recurso_id UUID NOT NULL REFERENCES public.patrimonios(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'reservado' CHECK (status IN ('reservado', 'confirmado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agendamento_id, recurso_id)
);

-- Enable RLS
ALTER TABLE public.calendarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamento_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamento_recursos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendarios
CREATE POLICY "Users can view public calendars" 
ON public.calendarios FOR SELECT
USING (visivel_para_todos = true OR proprietario_id = get_current_person_id() OR is_admin());

CREATE POLICY "Users can manage own calendars" 
ON public.calendarios FOR ALL
USING (proprietario_id = get_current_person_id() OR is_admin())
WITH CHECK (proprietario_id = get_current_person_id() OR is_admin());

-- RLS Policies for agendamentos
CREATE POLICY "Users can view agendamentos from accessible calendars" 
ON public.agendamentos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.calendarios c 
  WHERE c.id = agendamentos.calendario_id 
  AND (c.visivel_para_todos = true OR c.proprietario_id = get_current_person_id() OR is_admin())
));

CREATE POLICY "Users can manage agendamentos in own calendars" 
ON public.agendamentos FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.calendarios c 
  WHERE c.id = agendamentos.calendario_id 
  AND (c.proprietario_id = get_current_person_id() OR is_admin())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.calendarios c 
  WHERE c.id = agendamentos.calendario_id 
  AND (c.proprietario_id = get_current_person_id() OR is_admin())
));

-- RLS Policies for agendamento_participantes
CREATE POLICY "Users can view participants of accessible agendamentos" 
ON public.agendamento_participantes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.agendamentos a
  JOIN public.calendarios c ON c.id = a.calendario_id
  WHERE a.id = agendamento_participantes.agendamento_id
  AND (c.visivel_para_todos = true OR c.proprietario_id = get_current_person_id() OR is_admin())
) OR pessoa_id = get_current_person_id());

CREATE POLICY "Users can manage participants in own agendamentos" 
ON public.agendamento_participantes FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.agendamentos a
  JOIN public.calendarios c ON c.id = a.calendario_id
  WHERE a.id = agendamento_participantes.agendamento_id
  AND (c.proprietario_id = get_current_person_id() OR is_admin())
) OR pessoa_id = get_current_person_id())
WITH CHECK (EXISTS (
  SELECT 1 FROM public.agendamentos a
  JOIN public.calendarios c ON c.id = a.calendario_id
  WHERE a.id = agendamento_participantes.agendamento_id
  AND (c.proprietario_id = get_current_person_id() OR is_admin())
));

-- RLS Policies for agendamento_recursos
CREATE POLICY "Users can view recursos of accessible agendamentos" 
ON public.agendamento_recursos FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.agendamentos a
  JOIN public.calendarios c ON c.id = a.calendario_id
  WHERE a.id = agendamento_recursos.agendamento_id
  AND (c.visivel_para_todos = true OR c.proprietario_id = get_current_person_id() OR is_admin())
));

CREATE POLICY "Users can manage recursos in own agendamentos" 
ON public.agendamento_recursos FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.agendamentos a
  JOIN public.calendarios c ON c.id = a.calendario_id
  WHERE a.id = agendamento_recursos.agendamento_id
  AND (c.proprietario_id = get_current_person_id() OR is_admin())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.agendamentos a
  JOIN public.calendarios c ON c.id = a.calendario_id
  WHERE a.id = agendamento_recursos.agendamento_id
  AND (c.proprietario_id = get_current_person_id() OR is_admin())
));

-- Create triggers for updated_at
CREATE TRIGGER update_calendarios_updated_at
  BEFORE UPDATE ON public.calendarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_calendarios_proprietario ON public.calendarios(proprietario_id);
CREATE INDEX idx_agendamentos_calendario ON public.agendamentos(calendario_id);
CREATE INDEX idx_agendamentos_data_inicio ON public.agendamentos(data_hora_inicio);
CREATE INDEX idx_agendamento_participantes_agendamento ON public.agendamento_participantes(agendamento_id);
CREATE INDEX idx_agendamento_recursos_agendamento ON public.agendamento_recursos(agendamento_id);