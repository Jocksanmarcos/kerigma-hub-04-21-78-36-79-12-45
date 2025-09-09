-- Adicionar novos status para doações e melhorar controle
ALTER TABLE public.mural_doacoes 
ADD COLUMN IF NOT EXISTS data_entrega timestamp with time zone,
ADD COLUMN IF NOT EXISTS entregue_para_id uuid,
ADD COLUMN IF NOT EXISTS observacoes_entrega text;

-- Atualizar enum de status se não existir
DO $$ 
BEGIN
  -- Verificar se os status existem e adicionar novos se necessário
  UPDATE public.mural_doacoes 
  SET status = 'entregue' 
  WHERE status = 'entregue' AND NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%mural_doacoes_status%'
  );
END $$;

-- Criar tabela para notificações do doador
CREATE TABLE IF NOT EXISTS public.mural_notificacoes_doador (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doacao_id uuid NOT NULL REFERENCES public.mural_doacoes(id) ON DELETE CASCADE,
  doador_id uuid NOT NULL,
  tipo_notificacao text NOT NULL DEFAULT 'interesse_recebido',
  titulo text NOT NULL,
  mensagem text NOT NULL,
  lida boolean DEFAULT false,
  data_leitura timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mural_notificacoes_doador ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Doadores podem ver suas notificações" 
ON public.mural_notificacoes_doador 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.id = doador_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Sistema pode criar notificações" 
ON public.mural_notificacoes_doador 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Doadores podem marcar como lida" 
ON public.mural_notificacoes_doador 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM pessoas p 
    WHERE p.id = doador_id AND p.user_id = auth.uid()
  )
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_mural_notificacoes_doador_doador_id ON public.mural_notificacoes_doador(doador_id);
CREATE INDEX IF NOT EXISTS idx_mural_notificacoes_doador_lida ON public.mural_notificacoes_doador(lida);

-- Função para criar notificação automaticamente quando há interesse
CREATE OR REPLACE FUNCTION public.criar_notificacao_interesse()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.mural_notificacoes_doador (
    doacao_id,
    doador_id,
    tipo_notificacao,
    titulo,
    mensagem,
    metadata
  )
  SELECT 
    NEW.doacao_id,
    md.doador_id,
    'interesse_recebido',
    'Alguém tem interesse na sua doação!',
    p.nome_completo || ' demonstrou interesse na doação "' || md.titulo || '"',
    jsonb_build_object(
      'interessado_id', NEW.interessado_id,
      'interessado_nome', p.nome_completo,
      'mensagem_interesse', NEW.mensagem
    )
  FROM public.mural_doacoes md
  JOIN public.pessoas p ON p.id = NEW.interessado_id
  WHERE md.id = NEW.doacao_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_notificacao_interesse ON public.mural_interessados;
CREATE TRIGGER trigger_notificacao_interesse
  AFTER INSERT ON public.mural_interessados
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_notificacao_interesse();

COMMENT ON TABLE public.mural_notificacoes_doador IS 'Notificações para doadores sobre interesse nas suas doações';