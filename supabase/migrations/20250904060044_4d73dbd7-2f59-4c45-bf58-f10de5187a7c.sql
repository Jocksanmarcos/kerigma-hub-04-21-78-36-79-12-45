-- Central de Louvor - Criação das tabelas principais

-- Tabela de repertório com músicas do ministério
CREATE TABLE public.louvor_repertorio (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    artista TEXT,
    tom TEXT,
    bpm INTEGER,
    letra TEXT,
    cifra TEXT,
    link_referencia TEXT,
    tags TEXT[],
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Tabela de cargos do ministério de louvor
CREATE TABLE public.louvor_cargos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_cargo TEXT NOT NULL UNIQUE,
    descricao TEXT,
    cor TEXT DEFAULT '#3b82f6',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de relacionamento entre membros e seus cargos
CREATE TABLE public.louvor_membros_cargos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    membro_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    cargo_id UUID NOT NULL REFERENCES public.louvor_cargos(id) ON DELETE CASCADE,
    nivel_habilidade TEXT DEFAULT 'iniciante' CHECK (nivel_habilidade IN ('iniciante', 'intermediario', 'avancado')),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(membro_id, cargo_id)
);

-- Tabela de eventos/cultos com setlist
CREATE TABLE public.escalas_eventos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_evento TEXT NOT NULL,
    data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    local_evento TEXT,
    setlist JSONB DEFAULT '[]'::jsonb, -- Array de IDs do repertório
    observacoes TEXT,
    status TEXT DEFAULT 'planejado' CHECK (status IN ('planejado', 'confirmado', 'concluido', 'cancelado')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de membros escalados para eventos
CREATE TABLE public.escalas_membros (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    evento_id UUID NOT NULL REFERENCES public.escalas_eventos(id) ON DELETE CASCADE,
    membro_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    cargo_id UUID NOT NULL REFERENCES public.louvor_cargos(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'recusado')),
    observacoes TEXT,
    data_resposta TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(evento_id, membro_id, cargo_id)
);

-- Tabela de indisponibilidade dos membros
CREATE TABLE public.membros_indisponibilidade (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    membro_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    motivo TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CHECK (data_fim >= data_inicio)
);

-- Inserir cargos padrão
INSERT INTO public.louvor_cargos (nome_cargo, descricao, cor) VALUES 
('Vocal Principal', 'Vocalista principal do louvor', '#e11d48'),
('Vocal Apoio', 'Vocal de apoio e backing vocals', '#f97316'), 
('Guitarra', 'Guitarrista', '#eab308'),
('Baixo', 'Baixista', '#22c55e'),
('Bateria', 'Baterista', '#3b82f6'),
('Teclado', 'Tecladista', '#a855f7'),
('Violão', 'Violonista', '#8b5cf6'),
('Operador de Som', 'Responsável pela mesa de som', '#64748b');

-- Habilitar RLS
ALTER TABLE public.louvor_repertorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.louvor_cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.louvor_membros_cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_indisponibilidade ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para repertório
CREATE POLICY "Líderes podem gerenciar repertório" ON public.louvor_repertorio
    FOR ALL USING (is_lider_ministerio() OR is_admin());

CREATE POLICY "Membros podem ver repertório ativo" ON public.louvor_repertorio
    FOR SELECT USING (ativo = true);

-- Políticas RLS para cargos
CREATE POLICY "Líderes podem gerenciar cargos" ON public.louvor_cargos
    FOR ALL USING (is_lider_ministerio() OR is_admin());

CREATE POLICY "Todos podem ver cargos ativos" ON public.louvor_cargos
    FOR SELECT USING (ativo = true);

-- Políticas RLS para membros e cargos
CREATE POLICY "Líderes podem gerenciar membros e cargos" ON public.louvor_membros_cargos
    FOR ALL USING (is_lider_ministerio() OR is_admin());

CREATE POLICY "Membros podem ver próprios cargos" ON public.louvor_membros_cargos
    FOR SELECT USING (membro_id = get_current_person_id() OR is_lider_ministerio() OR is_admin());

-- Políticas RLS para eventos
CREATE POLICY "Líderes podem gerenciar eventos" ON public.escalas_eventos
    FOR ALL USING (is_lider_ministerio() OR is_admin());

CREATE POLICY "Membros podem ver eventos" ON public.escalas_eventos
    FOR SELECT USING (true);

-- Políticas RLS para escalas de membros
CREATE POLICY "Líderes podem gerenciar escalas" ON public.escalas_membros
    FOR ALL USING (is_lider_ministerio() OR is_admin());

CREATE POLICY "Membros podem ver próprias escalas" ON public.escalas_membros
    FOR SELECT USING (membro_id = get_current_person_id() OR is_lider_ministerio() OR is_admin());

CREATE POLICY "Membros podem responder próprios convites" ON public.escalas_membros
    FOR UPDATE USING (membro_id = get_current_person_id())
    WITH CHECK (membro_id = get_current_person_id());

-- Políticas RLS para indisponibilidade
CREATE POLICY "Líderes podem gerenciar indisponibilidades" ON public.membros_indisponibilidade
    FOR ALL USING (is_lider_ministerio() OR is_admin());

CREATE POLICY "Membros podem gerenciar própria indisponibilidade" ON public.membros_indisponibilidade
    FOR ALL USING (membro_id = get_current_person_id());

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_louvor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_louvor_repertorio_updated_at
    BEFORE UPDATE ON public.louvor_repertorio
    FOR EACH ROW EXECUTE FUNCTION public.update_louvor_updated_at();

CREATE TRIGGER update_escalas_eventos_updated_at
    BEFORE UPDATE ON public.escalas_eventos
    FOR EACH ROW EXECUTE FUNCTION public.update_louvor_updated_at();