-- =============================================================================
-- REFATORAÇÃO DO MÓDULO DE CÉLULAS V2
-- Ecossistema de Cuidado e Multiplicação com Painéis Adaptativos
-- =============================================================================

-- 1. Adicionar colunas na tabela pessoas (equivalente a profiles)
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS papel_lideranca TEXT CHECK (papel_lideranca IN ('lider_celula', 'supervisor', 'pastor_rede', 'coordenador', 'membro')),
ADD COLUMN IF NOT EXISTS lider_direto_id UUID REFERENCES public.pessoas(id);

-- 2. Adicionar colunas hierárquicas na tabela celulas
ALTER TABLE public.celulas 
ADD COLUMN IF NOT EXISTS coordenador_id UUID REFERENCES public.pessoas(id),
ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.pessoas(id),
ADD COLUMN IF NOT EXISTS pastor_rede_id UUID REFERENCES public.pessoas(id);

-- 3. Criar tabela de relatórios de células
CREATE TABLE IF NOT EXISTS public.relatorios_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  data_reuniao DATE NOT NULL,
  presentes INTEGER NOT NULL DEFAULT 0,
  visitantes INTEGER NOT NULL DEFAULT 0,
  decisoes INTEGER NOT NULL DEFAULT 0,
  oferta DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  lider_relatorio_id UUID REFERENCES public.pessoas(id),
  criado_por UUID REFERENCES public.pessoas(id),
  aprovado_por UUID REFERENCES public.pessoas(id),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Campos para análise inteligente
  clima_reuniao TEXT CHECK (clima_reuniao IN ('excelente', 'bom', 'regular', 'necessita_atencao')),
  pontos_fortes TEXT[],
  pontos_melhoria TEXT[],
  proximos_passos TEXT[],
  
  -- Metadados para insights
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(celula_id, data_reuniao)
);

-- 4. Crear tabela para insights automatizados
CREATE TABLE IF NOT EXISTS public.insights_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_insight TEXT NOT NULL CHECK (tipo_insight IN ('crescimento', 'retencao', 'engajamento', 'multiplicacao', 'alerta')),
  nivel_hierarquia TEXT NOT NULL CHECK (nivel_hierarquia IN ('celula', 'supervisao', 'rede')),
  entidade_id UUID NOT NULL, -- pode ser celula_id ou pessoa_id dependendo do contexto
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  metrica_principal JSONB,
  data_analise DATE NOT NULL,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  ativo BOOLEAN DEFAULT true,
  visualizado_por UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_relatorios_celulas_data ON public.relatorios_celulas(data_reuniao);
CREATE INDEX IF NOT EXISTS idx_relatorios_celulas_celula_data ON public.relatorios_celulas(celula_id, data_reuniao);
CREATE INDEX IF NOT EXISTS idx_relatorios_celulas_status ON public.relatorios_celulas(status);
CREATE INDEX IF NOT EXISTS idx_insights_nivel_entidade ON public.insights_celulas(nivel_hierarquia, entidade_id);
CREATE INDEX IF NOT EXISTS idx_insights_ativo_prioridade ON public.insights_celulas(ativo, prioridade);
CREATE INDEX IF NOT EXISTS idx_pessoas_papel_lideranca ON public.pessoas(papel_lideranca);

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_relatorios_celulas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_relatorios_celulas_updated_at
  BEFORE UPDATE ON public.relatorios_celulas
  FOR EACH ROW
  EXECUTE FUNCTION update_relatorios_celulas_updated_at();

-- 7. RLS Policies
ALTER TABLE public.relatorios_celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights_celulas ENABLE ROW LEVEL SECURITY;

-- Política para relatórios: líderes podem gerenciar relatórios de suas células
CREATE POLICY "relatorios_celulas_acesso_lider" ON public.relatorios_celulas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.celulas c 
      JOIN public.pessoas p ON p.id = c.lider_id 
      WHERE c.id = relatorios_celulas.celula_id 
      AND p.user_id = auth.uid()
    )
    OR 
    -- Supervisores podem ver relatórios de células sob sua supervisão
    EXISTS (
      SELECT 1 FROM public.celulas c 
      JOIN public.pessoas p ON p.id = c.supervisor_id 
      WHERE c.id = relatorios_celulas.celula_id 
      AND p.user_id = auth.uid()
    )
    OR 
    -- Administradores podem ver tudo
    is_admin()
  );

-- Política para insights: usuários veem insights relevantes ao seu nível
CREATE POLICY "insights_celulas_acesso_hierarquico" ON public.insights_celulas
  FOR SELECT USING (
    -- Insights de célula: líder da célula pode ver
    (nivel_hierarquia = 'celula' AND EXISTS (
      SELECT 1 FROM public.celulas c 
      JOIN public.pessoas p ON p.id = c.lider_id 
      WHERE c.id = insights_celulas.entidade_id 
      AND p.user_id = auth.uid()
    ))
    OR 
    -- Insights de supervisão: supervisor pode ver
    (nivel_hierarquia = 'supervisao' AND EXISTS (
      SELECT 1 FROM public.pessoas p 
      WHERE p.id = insights_celulas.entidade_id 
      AND p.user_id = auth.uid()
      AND p.papel_lideranca = 'supervisor'
    ))
    OR 
    -- Insights de rede: pastor de rede pode ver
    (nivel_hierarquia = 'rede' AND EXISTS (
      SELECT 1 FROM public.pessoas p 
      WHERE p.id = insights_celulas.entidade_id 
      AND p.user_id = auth.uid()
      AND p.papel_lideranca = 'pastor_rede'
    ))
    OR 
    -- Administradores podem ver tudo
    is_admin()
  );

-- 8. Função para obter papel de liderança do usuário atual
CREATE OR REPLACE FUNCTION get_papel_lideranca()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT papel_lideranca 
  FROM public.pessoas 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- 9. Função para obter células sob responsabilidade do usuário
CREATE OR REPLACE FUNCTION get_celulas_responsabilidade()
RETURNS TABLE(celula_id UUID, papel TEXT)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id as celula_id,
    CASE 
      WHEN c.lider_id = get_current_person_id() THEN 'lider'
      WHEN c.supervisor_id = get_current_person_id() THEN 'supervisor'
      WHEN c.pastor_rede_id = get_current_person_id() THEN 'pastor_rede'
      WHEN c.coordenador_id = get_current_person_id() THEN 'coordenador'
    END as papel
  FROM public.celulas c
  WHERE c.lider_id = get_current_person_id()
     OR c.supervisor_id = get_current_person_id()
     OR c.pastor_rede_id = get_current_person_id()
     OR c.coordenador_id = get_current_person_id();
$$;