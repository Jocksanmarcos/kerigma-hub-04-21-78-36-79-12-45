-- Criar tabela para notificações de escala
CREATE TABLE IF NOT EXISTS public.notificacoes_escala (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escalas_membro_id UUID REFERENCES public.escalas_membros(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('convite', 'resposta', 'lembrete', 'cancelamento')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviada' CHECK (status IN ('pendente', 'enviada', 'lida', 'erro')),
  lida_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes_escala ENABLE ROW LEVEL SECURITY;

-- Política para líderes poderem ver todas as notificações
CREATE POLICY "Líderes podem ver notificações de escala"
ON public.notificacoes_escala
FOR SELECT
USING (
  is_admin() OR 
  user_has_permission('manage', 'louvor') OR
  EXISTS (
    SELECT 1 FROM escalas_membros em
    JOIN pessoas p ON p.id = em.membro_id
    WHERE em.id = escalas_membro_id AND p.user_id = auth.uid()
  )
);

-- Política para membros poderem ver suas próprias notificações
CREATE POLICY "Membros podem ver próprias notificações"
ON public.notificacoes_escala
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM escalas_membros em
    JOIN pessoas p ON p.id = em.membro_id
    WHERE em.id = escalas_membro_id AND p.user_id = auth.uid()
  )
);

-- Política para sistema poder inserir notificações
CREATE POLICY "Sistema pode inserir notificações"
ON public.notificacoes_escala
FOR INSERT
WITH CHECK (true);

-- Política para marcar como lida
CREATE POLICY "Usuários podem marcar notificações como lidas"
ON public.notificacoes_escala
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM escalas_membros em
    JOIN pessoas p ON p.id = em.membro_id
    WHERE em.id = escalas_membro_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM escalas_membros em
    JOIN pessoas p ON p.id = em.membro_id
    WHERE em.id = escalas_membro_id AND p.user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notificacoes_escala_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notificacoes_escala_updated_at
  BEFORE UPDATE ON public.notificacoes_escala
  FOR EACH ROW
  EXECUTE FUNCTION update_notificacoes_escala_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_escala_membro_id ON public.notificacoes_escala(escalas_membro_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_escala_status ON public.notificacoes_escala(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_escala_created_at ON public.notificacoes_escala(created_at DESC);