-- ===============================
-- WORSHIP PRODUCTION STUDIO SCHEMA
-- ===============================

-- Create enum for confirmation status
CREATE TYPE confirmation_status AS ENUM ('Convidado', 'Confirmado', 'Recusado');

-- Create culto_planos table
CREATE TABLE public.culto_planos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  congregacao_id UUID REFERENCES public.congregacoes(id),
  tema_culto TEXT NOT NULL,
  is_template BOOLEAN NOT NULL DEFAULT false,
  descricao TEXT,
  versao INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'rascunho',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.pessoas(id)
);

-- Create culto_ordem_itens table
CREATE TABLE public.culto_ordem_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES public.culto_planos(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  titulo_item TEXT NOT NULL,
  duracao_estimada_min INTEGER DEFAULT 5,
  detalhes TEXT,
  tipo_item TEXT DEFAULT 'geral', -- 'louvor', 'pregacao', 'oracao', 'geral'
  responsavel_id UUID REFERENCES public.pessoas(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create louvor_musicas table
CREATE TABLE public.louvor_musicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  artista TEXT,
  compositor TEXT,
  tonalidade TEXT,
  bpm INTEGER,
  link_cifra_pdf TEXT,
  link_audio_youtube TEXT,
  link_spotify TEXT,
  letra TEXT,
  categoria TEXT DEFAULT 'adoracao', -- 'adoracao', 'quebrantamento', 'celebracao', 'intimidade'
  tags TEXT[],
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.pessoas(id)
);

-- Create culto_setlist table
CREATE TABLE public.culto_setlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES public.culto_planos(id) ON DELETE CASCADE,
  musica_id UUID NOT NULL REFERENCES public.louvor_musicas(id),
  ordem INTEGER NOT NULL,
  tonalidade_escolhida TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create escalas_servico table
CREATE TABLE public.escalas_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES public.culto_planos(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  funcao TEXT NOT NULL, -- 'Baterista', 'Diácono', 'Receção', 'Guitarra', 'Vocal', etc.
  status_confirmacao confirmation_status NOT NULL DEFAULT 'Convidado',
  data_convite TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_resposta TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  substituido_por UUID REFERENCES public.pessoas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.pessoas(id)
);

-- Create funcoes_ministerio table for managing available functions
CREATE TABLE public.funcoes_ministerio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL, -- 'louvor', 'tecnico', 'recepcao', 'diaconia'
  cor TEXT DEFAULT '#3b82f6',
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications for service invitations
CREATE TABLE public.convites_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escala_id UUID NOT NULL REFERENCES public.escalas_servico(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id),
  titulo TEXT NOT NULL,
  mensagem TEXT,
  lido BOOLEAN NOT NULL DEFAULT false,
  data_expiracao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.culto_planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.culto_ordem_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.louvor_musicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.culto_setlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcoes_ministerio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites_servico ENABLE ROW LEVEL SECURITY;

-- RLS Policies for culto_planos
CREATE POLICY "Líderes podem gerenciar planos de culto" 
ON public.culto_planos 
FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'cultos'));

CREATE POLICY "Membros podem ver planos finalizados" 
ON public.culto_planos 
FOR SELECT 
USING (status = 'finalizado' OR is_admin() OR user_has_permission('read', 'cultos'));

-- RLS Policies for culto_ordem_itens
CREATE POLICY "Acesso a itens segue acesso ao plano" 
ON public.culto_ordem_itens 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.culto_planos cp 
  WHERE cp.id = culto_ordem_itens.plano_id 
  AND (is_admin() OR user_has_permission('manage', 'cultos') OR cp.status = 'finalizado')
));

-- RLS Policies for louvor_musicas
CREATE POLICY "Músicos e líderes podem gerenciar músicas" 
ON public.louvor_musicas 
FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'louvor'));

CREATE POLICY "Todos podem ver músicas ativas" 
ON public.louvor_musicas 
FOR SELECT 
USING (ativa = true);

-- RLS Policies for culto_setlist
CREATE POLICY "Acesso a setlist segue acesso ao plano" 
ON public.culto_setlist 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.culto_planos cp 
  WHERE cp.id = culto_setlist.plano_id 
  AND (is_admin() OR user_has_permission('manage', 'cultos') OR cp.status = 'finalizado')
));

-- RLS Policies for escalas_servico
CREATE POLICY "Líderes podem gerenciar escalas" 
ON public.escalas_servico 
FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'escalas'));

CREATE POLICY "Voluntários podem ver próprias escalas" 
ON public.escalas_servico 
FOR SELECT 
USING (pessoa_id = get_current_person_id());

CREATE POLICY "Voluntários podem atualizar próprio status" 
ON public.escalas_servico 
FOR UPDATE 
USING (pessoa_id = get_current_person_id()) 
WITH CHECK (pessoa_id = get_current_person_id());

-- RLS Policies for funcoes_ministerio
CREATE POLICY "Líderes podem gerenciar funções" 
ON public.funcoes_ministerio 
FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'ministerio'));

CREATE POLICY "Todos podem ver funções ativas" 
ON public.funcoes_ministerio 
FOR SELECT 
USING (ativa = true);

-- RLS Policies for convites_servico
CREATE POLICY "Líderes podem gerenciar convites" 
ON public.convites_servico 
FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'escalas'));

CREATE POLICY "Usuários podem ver próprios convites" 
ON public.convites_servico 
FOR SELECT 
USING (pessoa_id = get_current_person_id());

CREATE POLICY "Usuários podem marcar próprios convites como lidos" 
ON public.convites_servico 
FOR UPDATE 
USING (pessoa_id = get_current_person_id()) 
WITH CHECK (pessoa_id = get_current_person_id());

-- Indexes for performance
CREATE INDEX idx_culto_planos_agendamento ON public.culto_planos(agendamento_id);
CREATE INDEX idx_culto_planos_congregacao ON public.culto_planos(congregacao_id);
CREATE INDEX idx_culto_ordem_plano ON public.culto_ordem_itens(plano_id);
CREATE INDEX idx_culto_setlist_plano ON public.culto_setlist(plano_id);
CREATE INDEX idx_escalas_servico_plano ON public.escalas_servico(plano_id);
CREATE INDEX idx_escalas_servico_pessoa ON public.escalas_servico(pessoa_id);
CREATE INDEX idx_convites_servico_pessoa ON public.convites_servico(pessoa_id);

-- Triggers for updated_at
CREATE TRIGGER update_culto_planos_updated_at
  BEFORE UPDATE ON public.culto_planos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_culto_ordem_itens_updated_at
  BEFORE UPDATE ON public.culto_ordem_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_louvor_musicas_updated_at
  BEFORE UPDATE ON public.louvor_musicas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escalas_servico_updated_at
  BEFORE UPDATE ON public.escalas_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funcoes_ministerio_updated_at
  BEFORE UPDATE ON public.funcoes_ministerio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default ministry functions
INSERT INTO public.funcoes_ministerio (nome, descricao, categoria, cor) VALUES
('Vocal Principal', 'Líder de louvor', 'louvor', '#10b981'),
('Vocal de Apoio', 'Backing vocal', 'louvor', '#22c55e'),
('Guitarra', 'Guitarrista', 'louvor', '#f59e0b'),
('Baixo', 'Baixista', 'louvor', '#ef4444'),
('Bateria', 'Baterista', 'louvor', '#8b5cf6'),
('Teclado', 'Tecladista', 'louvor', '#06b6d4'),
('Violão', 'Violonista', 'louvor', '#84cc16'),
('Som', 'Operador de som', 'tecnico', '#6b7280'),
('Projeção', 'Operador de slides', 'tecnico', '#374151'),
('Filmagem', 'Cinegrafista', 'tecnico', '#1f2937'),
('Diácono', 'Diácono de plantão', 'diaconia', '#dc2626'),
('Recepção', 'Recepcionista', 'recepcao', '#2563eb'),
('Berçário', 'Cuidador de crianças', 'recepcao', '#db2777'),
('Segurança', 'Segurança', 'recepcao', '#7c3aed'),
('Limpeza', 'Responsável pela limpeza', 'diaconia', '#059669');