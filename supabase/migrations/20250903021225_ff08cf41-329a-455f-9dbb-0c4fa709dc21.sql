-- === FUNDAÇÃO DE DADOS DO CENTRO DE COMANDO PASTORAL ===
-- Expansão da tabela pessoas existente com novos campos estratégicos

-- Adicionar novos campos à tabela pessoas existente
ALTER TABLE public.pessoas
ADD COLUMN IF NOT EXISTS data_batismo DATE,
ADD COLUMN IF NOT EXISTS data_membresia DATE,
ADD COLUMN IF NOT EXISTS dons_talentos TEXT[]; -- Array de dons e talentos

COMMENT ON COLUMN public.pessoas.dons_talentos IS 'Lista de dons e talentos do membro, ex: {"Música", "Ensino", "Liderança"}';

-- === TABELA PARA RELACIONAMENTOS FAMILIARES (ÁRVORE GENEALÓGICA) ===
CREATE TABLE IF NOT EXISTS public.relacionamentos_familiares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa1_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  pessoa2_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  tipo_relacionamento TEXT NOT NULL CHECK (tipo_relacionamento IN (
    'Cônjuge', 'Pai/Mãe', 'Filho/Filha', 'Irmão/Irmã', 
    'Avô/Avó', 'Neto/Neta', 'Tio/Tia', 'Sobrinho/Sobrinha', 'Outro'
  )),
  data_inicio DATE, -- Quando o relacionamento começou (casamento, nascimento, etc)
  ativo BOOLEAN DEFAULT TRUE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Garante que um relacionamento entre duas pessoas seja único
  UNIQUE(pessoa1_id, pessoa2_id, tipo_relacionamento)
);

COMMENT ON TABLE public.relacionamentos_familiares IS 'Mapeia conexões familiares entre membros para construção da árvore genealógica';

-- Índices para otimizar consultas familiares
CREATE INDEX IF NOT EXISTS idx_relacionamentos_pessoa1 ON public.relacionamentos_familiares(pessoa1_id);
CREATE INDEX IF NOT EXISTS idx_relacionamentos_pessoa2 ON public.relacionamentos_familiares(pessoa2_id);

-- === TABELA PARA NOTAS PASTORAIS CONFIDENCIAIS ===
CREATE TABLE IF NOT EXISTS public.notas_pastorais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  pastor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL DEFAULT 'geral' CHECK (categoria IN (
    'geral', 'aconselhamento', 'discipulado', 'ministerio', 
    'familia', 'saude', 'financeiro', 'crescimento_espiritual'
  )),
  nota TEXT NOT NULL,
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  visivel_para TEXT[] DEFAULT ARRAY['pastor'], -- Controla quem pode ver a nota
  data_followup DATE, -- Para acompanhamentos futuros
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.notas_pastorais IS 'Notas pastorais confidenciais sobre membros para acompanhamento pastoral';

-- Índices para otimizar consultas pastorais
CREATE INDEX IF NOT EXISTS idx_notas_membro ON public.notas_pastorais(membro_id);
CREATE INDEX IF NOT EXISTS idx_notas_pastor ON public.notas_pastorais(pastor_id);
CREATE INDEX IF NOT EXISTS idx_notas_categoria ON public.notas_pastorais(categoria);
CREATE INDEX IF NOT EXISTS idx_notas_prioridade ON public.notas_pastorais(prioridade);

-- === TABELA PARA HISTÓRICO DE ATIVIDADES DOS MEMBROS ===
CREATE TABLE IF NOT EXISTS public.historico_atividades_membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  tipo_atividade TEXT NOT NULL CHECK (tipo_atividade IN (
    'presenca_culto', 'presenca_celula', 'ministerio', 'evento',
    'doacao', 'voluntariado', 'curso', 'aconselhamento'
  )),
  descricao TEXT NOT NULL,
  data_atividade DATE NOT NULL,
  detalhes JSONB DEFAULT '{}', -- Informações específicas por tipo
  pontuacao INTEGER DEFAULT 0, -- Para sistema de gamificação
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.historico_atividades_membros IS 'Registra todas as atividades dos membros para análise de engajamento';

-- Índices para otimizar consultas de atividades
CREATE INDEX IF NOT EXISTS idx_atividades_membro ON public.historico_atividades_membros(membro_id);
CREATE INDEX IF NOT EXISTS idx_atividades_data ON public.historico_atividades_membros(data_atividade);
CREATE INDEX IF NOT EXISTS idx_atividades_tipo ON public.historico_atividades_membros(tipo_atividade);

-- === TABELA PARA METAS E OBJETIVOS PASTORAIS ===
CREATE TABLE IF NOT EXISTS public.metas_pastorais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_meta TEXT NOT NULL CHECK (tipo_meta IN (
    'crescimento_numerico', 'discipulado', 'ministerios', 
    'eventos', 'financeiro', 'engajamento'
  )),
  valor_atual NUMERIC DEFAULT 0,
  valor_meta NUMERIC NOT NULL,
  unidade_medida TEXT DEFAULT 'pessoas', -- pessoas, eventos, valor, percentual
  data_inicio DATE NOT NULL,
  data_prazo DATE NOT NULL,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'concluida', 'cancelada')),
  responsavel_id UUID REFERENCES auth.users(id),
  igreja_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.metas_pastorais IS 'Define e acompanha metas estratégicas da liderança pastoral';

-- === POLÍTICAS RLS PARA SEGURANÇA ===

-- Relacionamentos Familiares
ALTER TABLE public.relacionamentos_familiares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Líderes podem ver relacionamentos familiares" 
ON public.relacionamentos_familiares FOR SELECT 
USING (is_sede_admin() OR is_pastor_missao());

CREATE POLICY "Líderes podem gerenciar relacionamentos familiares" 
ON public.relacionamentos_familiares FOR ALL 
USING (is_sede_admin() OR is_pastor_missao());

-- Notas Pastorais (ACESSO ULTRA RESTRITO)
ALTER TABLE public.notas_pastorais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas pastores podem ver notas pastorais" 
ON public.notas_pastorais FOR SELECT 
USING (
  auth.uid() = pastor_id OR 
  is_sede_admin() OR 
  is_pastor_missao()
);

CREATE POLICY "Apenas pastores podem criar notas pastorais" 
ON public.notas_pastorais FOR INSERT 
WITH CHECK (
  is_sede_admin() OR 
  is_pastor_missao()
);

CREATE POLICY "Apenas quem criou pode editar notas pastorais" 
ON public.notas_pastorais FOR UPDATE 
USING (auth.uid() = pastor_id OR is_sede_admin());

-- Histórico de Atividades
ALTER TABLE public.historico_atividades_membros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Líderes podem ver histórico de atividades" 
ON public.historico_atividades_membros FOR SELECT 
USING (is_sede_admin() OR is_pastor_missao());

CREATE POLICY "Sistema pode registrar atividades" 
ON public.historico_atividades_membros FOR INSERT 
WITH CHECK (TRUE);

-- Metas Pastorais
ALTER TABLE public.metas_pastorais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Líderes podem gerenciar metas pastorais" 
ON public.metas_pastorais FOR ALL 
USING (is_sede_admin() OR is_pastor_missao());

-- === TRIGGERS PARA TIMESTAMPS AUTOMÁTICOS ===

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
CREATE TRIGGER update_relacionamentos_updated_at
  BEFORE UPDATE ON public.relacionamentos_familiares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notas_updated_at
  BEFORE UPDATE ON public.notas_pastorais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metas_updated_at
  BEFORE UPDATE ON public.metas_pastorais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();