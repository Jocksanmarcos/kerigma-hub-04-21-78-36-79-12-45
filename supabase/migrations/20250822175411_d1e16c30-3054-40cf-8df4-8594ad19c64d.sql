-- Create agendamentos table for counseling appointments
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  conselheiro_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_hora_inicio TIMESTAMPTZ NOT NULL,
  data_hora_fim TIMESTAMPTZ NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  link_meet VARCHAR(255),
  google_event_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'solicitado',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  motivo_recusa TEXT,
  observacoes TEXT,
  CONSTRAINT chk_status_agendamento CHECK (status IN ('solicitado', 'agendado', 'recusado', 'cancelado', 'realizado')),
  CONSTRAINT chk_horario_valido CHECK (data_hora_fim > data_hora_inicio)
);

-- Enable RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Acesso aos próprios agendamentos" ON public.agendamentos
  FOR SELECT 
  USING (auth.uid() = solicitante_id OR auth.uid() = conselheiro_id);

CREATE POLICY "Usuários podem criar solicitações" ON public.agendamentos
  FOR INSERT 
  WITH CHECK (auth.uid() = solicitante_id);

CREATE POLICY "Gerenciamento de agendamentos" ON public.agendamentos
  FOR UPDATE 
  USING (auth.uid() = conselheiro_id OR auth.uid() = solicitante_id);

CREATE POLICY "Conselheiros podem deletar agendamentos" ON public.agendamentos
  FOR DELETE 
  USING (auth.uid() = conselheiro_id);

-- Create index for better performance
CREATE INDEX idx_agendamentos_conselheiro ON public.agendamentos(conselheiro_id);
CREATE INDEX idx_agendamentos_solicitante ON public.agendamentos(solicitante_id);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);
CREATE INDEX idx_agendamentos_data ON public.agendamentos(data_hora_inicio);

-- Function to check scheduling conflicts
CREATE OR REPLACE FUNCTION check_agendamento_conflict()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check conflicts for 'agendado' status and same conselheiro
  IF NEW.status = 'agendado' AND EXISTS (
    SELECT 1 FROM public.agendamentos 
    WHERE conselheiro_id = NEW.conselheiro_id 
    AND status = 'agendado'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      (NEW.data_hora_inicio, NEW.data_hora_fim) OVERLAPS (data_hora_inicio, data_hora_fim)
    )
  ) THEN
    RAISE EXCEPTION 'Conflito de horário: o conselheiro já possui um agendamento neste período';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conflict checking
CREATE TRIGGER trigger_check_agendamento_conflict
  BEFORE INSERT OR UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION check_agendamento_conflict();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_agendamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_agendamentos_updated_at();