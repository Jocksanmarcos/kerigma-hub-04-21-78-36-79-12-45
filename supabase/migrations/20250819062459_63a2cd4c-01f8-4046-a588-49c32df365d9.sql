-- Criar tabela para logs de notificações da biblioteca
CREATE TABLE IF NOT EXISTS public.biblioteca_notificacoes_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reserva_id UUID REFERENCES public.biblioteca_reservas(id) ON DELETE CASCADE,
  tipo_notificacao TEXT NOT NULL CHECK (tipo_notificacao IN ('confirmacao', 'aprovacao', 'recusa', 'lembrete_retirada', 'lembrete_devolucao', 'erro')),
  email_destinatario TEXT NOT NULL,
  status_envio TEXT NOT NULL DEFAULT 'pendente' CHECK (status_envio IN ('pendente', 'enviado', 'erro', 'bounce')),
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  motivo_recusa TEXT,
  erro_detalhes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para performance
CREATE INDEX idx_biblioteca_notificacoes_reserva_id ON public.biblioteca_notificacoes_log(reserva_id);
CREATE INDEX idx_biblioteca_notificacoes_tipo ON public.biblioteca_notificacoes_log(tipo_notificacao);
CREATE INDEX idx_biblioteca_notificacoes_status ON public.biblioteca_notificacoes_log(status_envio);
CREATE INDEX idx_biblioteca_notificacoes_data ON public.biblioteca_notificacoes_log(data_envio);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_biblioteca_notificacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_biblioteca_notificacoes_updated_at
  BEFORE UPDATE ON public.biblioteca_notificacoes_log
  FOR EACH ROW
  EXECUTE FUNCTION update_biblioteca_notificacoes_updated_at();

-- RLS Policies
ALTER TABLE public.biblioteca_notificacoes_log ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os logs
CREATE POLICY "Admins podem gerenciar logs de notificações" 
ON public.biblioteca_notificacoes_log
FOR ALL
USING (is_admin() OR user_has_permission('manage', 'biblioteca'))
WITH CHECK (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Sistema pode inserir logs
CREATE POLICY "Sistema pode inserir logs de notificações" 
ON public.biblioteca_notificacoes_log
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Adicionar campo para rastreamento de motivo de recusa nas reservas
ALTER TABLE public.biblioteca_reservas 
ADD COLUMN IF NOT EXISTS motivo_recusa TEXT,
ADD COLUMN IF NOT EXISTS processado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS data_processamento TIMESTAMP WITH TIME ZONE;