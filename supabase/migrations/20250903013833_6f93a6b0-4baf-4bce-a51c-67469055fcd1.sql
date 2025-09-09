-- =============================================
-- CENTRO DE COMANDO PASTORAL - ARQUITETURA DE DADOS
-- =============================================

-- 1. Expandir tabela pessoas com campos 360°
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS data_batismo DATE;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS data_membresia DATE;
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS dons_talentos TEXT[];
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS ministerios TEXT[];
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS celula_id UUID REFERENCES public.celulas(id);
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS status_membro TEXT DEFAULT 'membro';
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS ultima_presenca DATE;

-- 2. Criar tabela de relacionamentos familiares
CREATE TABLE IF NOT EXISTS public.relacionamentos_familiares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa1_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
    pessoa2_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
    tipo_relacionamento TEXT NOT NULL, -- 'conjuge', 'pai', 'mae', 'filho', 'filha', 'irmao', 'irma'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(pessoa1_id, pessoa2_id, tipo_relacionamento)
);

-- 3. Criar tabela de notas pastorais (confidencial)
CREATE TABLE IF NOT EXISTS public.notas_pastorais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
    pastor_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
    nota TEXT NOT NULL,
    confidencial BOOLEAN DEFAULT true,
    categoria TEXT DEFAULT 'geral', -- 'aconselhamento', 'disciplina', 'crescimento', 'geral'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Criar tabela de insights pastorais da IA
CREATE TABLE IF NOT EXISTS public.insights_pastorais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL, -- 'oportunidade', 'atencao', 'celebracao', 'acao'
    prioridade TEXT DEFAULT 'media', -- 'alta', 'media', 'baixa'
    dados_contexto JSONB,
    status TEXT DEFAULT 'novo', -- 'novo', 'em_andamento', 'concluido', 'arquivado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days')
);

-- 5. Criar tabela de acompanhamento de visitantes
CREATE TABLE IF NOT EXISTS public.acompanhamento_visitantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitante_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
    responsavel_id UUID REFERENCES public.pessoas(id),
    data_primeira_visita DATE NOT NULL,
    status_acompanhamento TEXT DEFAULT 'novo', -- 'novo', 'em_contato', 'visitado', 'integrado', 'perdido'
    proxima_acao TEXT,
    data_proxima_acao DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- RLS POLICIES - SEGURANÇA E PRIVACIDADE
-- =============================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.relacionamentos_familiares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_pastorais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights_pastorais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acompanhamento_visitantes ENABLE ROW LEVEL SECURITY;

-- Policies para relacionamentos familiares
CREATE POLICY "Admins podem gerenciar relacionamentos familiares" 
ON public.relacionamentos_familiares FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'familias'));

-- Policies para notas pastorais (EXTREMAMENTE RESTRITIVAS)
CREATE POLICY "Apenas pastores podem ver notas pastorais" 
ON public.notas_pastorais FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.pessoas p 
        WHERE p.user_id = auth.uid() 
        AND p.tipo_pessoa IN ('pastor', 'lider')
    )
);

CREATE POLICY "Apenas pastores podem criar notas pastorais" 
ON public.notas_pastorais FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.pessoas p 
        WHERE p.user_id = auth.uid() 
        AND p.tipo_pessoa IN ('pastor', 'lider')
    )
);

-- Policies para insights pastorais
CREATE POLICY "Líderes podem ver insights pastorais" 
ON public.insights_pastorais FOR SELECT 
USING (is_admin() OR user_has_permission('read', 'insights'));

CREATE POLICY "Sistema pode inserir insights pastorais" 
ON public.insights_pastorais FOR INSERT 
WITH CHECK (true);

-- Policies para acompanhamento de visitantes
CREATE POLICY "Líderes podem gerenciar acompanhamento de visitantes" 
ON public.acompanhamento_visitantes FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'visitantes'));

-- =============================================
-- TRIGGERS E FUNÇÕES AUXILIARES
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_relacionamentos_familiares_updated_at ON public.relacionamentos_familiares;
CREATE TRIGGER update_relacionamentos_familiares_updated_at
    BEFORE UPDATE ON public.relacionamentos_familiares
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notas_pastorais_updated_at ON public.notas_pastorais;
CREATE TRIGGER update_notas_pastorais_updated_at
    BEFORE UPDATE ON public.notas_pastorais
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_acompanhamento_visitantes_updated_at ON public.acompanhamento_visitantes;
CREATE TRIGGER update_acompanhamento_visitantes_updated_at
    BEFORE UPDATE ON public.acompanhamento_visitantes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para obter métricas pastorais
CREATE OR REPLACE FUNCTION public.get_metricas_pastorais()
RETURNS TABLE(
    novos_membros_30d INTEGER,
    visitantes_acompanhar INTEGER,
    aniversariantes_semana INTEGER,
    membros_sem_celula INTEGER,
    total_membros INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.pessoas 
         WHERE data_membresia >= CURRENT_DATE - INTERVAL '30 days' 
         AND situacao = 'ativo') as novos_membros_30d,
        
        (SELECT COUNT(*)::INTEGER FROM public.acompanhamento_visitantes 
         WHERE status_acompanhamento IN ('novo', 'em_contato')) as visitantes_acompanhar,
        
        (SELECT COUNT(*)::INTEGER FROM public.pessoas 
         WHERE EXTRACT(WEEK FROM data_nascimento) = EXTRACT(WEEK FROM CURRENT_DATE)
         AND situacao = 'ativo') as aniversariantes_semana,
        
        (SELECT COUNT(*)::INTEGER FROM public.pessoas 
         WHERE celula_id IS NULL AND situacao = 'ativo' 
         AND tipo_pessoa = 'membro') as membros_sem_celula,
        
        (SELECT COUNT(*)::INTEGER FROM public.pessoas 
         WHERE situacao = 'ativo') as total_membros;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;