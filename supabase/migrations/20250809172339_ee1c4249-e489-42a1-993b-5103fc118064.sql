-- Create enum for appointment status
CREATE TYPE status_agendamento_pastoral AS ENUM ('solicitado', 'agendado', 'concluido', 'cancelado');

-- Create table for pastoral appointments
CREATE TABLE public.agendamentos_pastorais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitante_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
  pastor_responsavel_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL,
  motivo_contato TEXT NOT NULL,
  detalhes_pedido TEXT,
  urgencia TEXT CHECK (urgencia IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  status status_agendamento_pastoral NOT NULL DEFAULT 'solicitado',
  agendamento_id UUID REFERENCES public.eventos(id) ON DELETE SET NULL,
  telefone_contato TEXT,
  email_contato TEXT,
  preferencia_horario TEXT,
  observacoes_pastor TEXT,
  data_solicitacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_agendamento TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  confidencial BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agendamentos_pastorais ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Solicitantes podem ver próprios pedidos" 
ON public.agendamentos_pastorais 
FOR SELECT 
USING (solicitante_id = get_current_person_id());

CREATE POLICY "Solicitantes podem criar pedidos" 
ON public.agendamentos_pastorais 
FOR INSERT 
WITH CHECK (solicitante_id = get_current_person_id());

CREATE POLICY "Pastores podem gerenciar aconselhamento" 
ON public.agendamentos_pastorais 
FOR ALL 
USING (
  is_admin() OR 
  user_has_permission('manage', 'aconselhamento_pastoral') OR
  pastor_responsavel_id = get_current_person_id()
);

-- Create trigger for updated_at
CREATE TRIGGER update_agendamentos_pastorais_updated_at
BEFORE UPDATE ON public.agendamentos_pastorais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_agendamentos_pastorais_solicitante ON public.agendamentos_pastorais(solicitante_id);
CREATE INDEX idx_agendamentos_pastorais_pastor ON public.agendamentos_pastorais(pastor_responsavel_id);
CREATE INDEX idx_agendamentos_pastorais_status ON public.agendamentos_pastorais(status);
CREATE INDEX idx_agendamentos_pastorais_data ON public.agendamentos_pastorais(data_solicitacao);