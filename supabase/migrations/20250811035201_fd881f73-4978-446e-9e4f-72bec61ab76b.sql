-- === ETAPA 1: DEMOLIÇÃO E RECONSTRUÇÃO DA BASE DE DADOS ===

-- Primeiro, remover tabelas específicas de louvor (se existirem)
DROP TABLE IF EXISTS public.louvor_escala_participantes CASCADE;
DROP TABLE IF EXISTS public.louvor_escala_musicas CASCADE;
DROP TABLE IF EXISTS public.louvor_escalas CASCADE;
DROP TABLE IF EXISTS public.louvor_repertorio CASCADE;
DROP TABLE IF EXISTS public.louvor_musicos CASCADE;

-- Criar enum para status de confirmação
CREATE TYPE public.status_confirmacao_escala AS ENUM ('Convidado', 'Confirmado', 'Recusado');

-- Tabela de ministérios
CREATE TABLE public.ministerios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    lider_id UUID REFERENCES public.pessoas(id),
    codigo_convite TEXT NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de funções de cada ministério
CREATE TABLE public.ministerio_funcoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ministerio_id UUID NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
    nome_funcao TEXT NOT NULL,
    descricao TEXT,
    nivel_experiencia TEXT DEFAULT 'iniciante',
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(ministerio_id, nome_funcao)
);

-- Tabela de membros de cada ministério
CREATE TABLE public.ministerio_membros (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
    ministerio_id UUID NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
    funcoes UUID[] DEFAULT '{}', -- Array de IDs de ministerio_funcoes
    nivel_competencia TEXT DEFAULT 'iniciante',
    data_ingresso DATE DEFAULT CURRENT_DATE,
    ativo BOOLEAN NOT NULL DEFAULT true,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(pessoa_id, ministerio_id)
);

-- Tabela de escalas de serviço
CREATE TABLE public.escalas_ministerio (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,
    ministerio_id UUID NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    local TEXT,
    status TEXT DEFAULT 'planejada',
    criado_por UUID REFERENCES public.pessoas(id),
    instrucoes_especiais TEXT,
    materiais_necessarios JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de participantes convocados para cada escala
CREATE TABLE public.escala_participantes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    escala_id UUID NOT NULL REFERENCES public.escalas_ministerio(id) ON DELETE CASCADE,
    membro_id UUID NOT NULL REFERENCES public.ministerio_membros(id) ON DELETE CASCADE,
    funcao_escalada_id UUID REFERENCES public.ministerio_funcoes(id),
    status_confirmacao public.status_confirmacao_escala DEFAULT 'Convidado',
    data_convite TIMESTAMP WITH TIME ZONE DEFAULT now(),
    data_resposta TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    substituido_por UUID REFERENCES public.ministerio_membros(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(escala_id, membro_id, funcao_escalada_id)
);

-- Tabela de convites pendentes
CREATE TABLE public.convites_ministerio (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ministerio_id UUID NOT NULL REFERENCES public.ministerios(id) ON DELETE CASCADE,
    email_convidado TEXT NOT NULL,
    token_convite TEXT NOT NULL UNIQUE,
    enviado_por UUID NOT NULL REFERENCES public.pessoas(id),
    funcoes_sugeridas UUID[] DEFAULT '{}',
    mensagem_personalizada TEXT,
    data_convite TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    usado BOOLEAN DEFAULT false,
    usado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Função para gerar código de convite único
CREATE OR REPLACE FUNCTION public.gerar_codigo_convite_ministerio()
RETURNS TEXT AS $$
DECLARE
    codigo TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        -- Gerar código de 8 caracteres (letras maiúsculas e números)
        codigo := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM public.ministerios WHERE codigo_convite = codigo) INTO existe;
        
        -- Se não existe, retornar o código
        IF NOT existe THEN
            RETURN codigo;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para gerar código de convite automaticamente
CREATE OR REPLACE FUNCTION public.trigger_gerar_codigo_convite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_convite IS NULL OR NEW.codigo_convite = '' THEN
        NEW.codigo_convite := public.gerar_codigo_convite_ministerio();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ministerios_codigo_convite
    BEFORE INSERT ON public.ministerios
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_gerar_codigo_convite();

-- Triggers para updated_at
CREATE TRIGGER update_ministerios_updated_at
    BEFORE UPDATE ON public.ministerios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ministerio_funcoes_updated_at
    BEFORE UPDATE ON public.ministerio_funcoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ministerio_membros_updated_at
    BEFORE UPDATE ON public.ministerio_membros
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escalas_ministerio_updated_at
    BEFORE UPDATE ON public.escalas_ministerio
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escala_participantes_updated_at
    BEFORE UPDATE ON public.escala_participantes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.ministerios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministerio_funcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministerio_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_ministerio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convites_ministerio ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ministerios
CREATE POLICY "Líderes podem gerenciar seus ministérios" ON public.ministerios
    FOR ALL USING (lider_id = get_current_person_id() OR is_admin());

CREATE POLICY "Membros podem ver seus ministérios" ON public.ministerios
    FOR SELECT USING (
        ativo = true AND (
            lider_id = get_current_person_id() OR 
            is_admin() OR
            EXISTS(SELECT 1 FROM public.ministerio_membros WHERE ministerio_id = ministerios.id AND pessoa_id = get_current_person_id() AND ativo = true)
        )
    );

-- Políticas RLS para ministerio_funcoes
CREATE POLICY "Acesso a funções segue acesso ao ministério" ON public.ministerio_funcoes
    FOR ALL USING (
        EXISTS(SELECT 1 FROM public.ministerios WHERE id = ministerio_funcoes.ministerio_id AND (
            lider_id = get_current_person_id() OR 
            is_admin() OR
            EXISTS(SELECT 1 FROM public.ministerio_membros WHERE ministerio_id = ministerios.id AND pessoa_id = get_current_person_id() AND ativo = true)
        ))
    );

-- Políticas RLS para ministerio_membros
CREATE POLICY "Líderes podem gerenciar membros de seus ministérios" ON public.ministerio_membros
    FOR ALL USING (
        EXISTS(SELECT 1 FROM public.ministerios WHERE id = ministerio_membros.ministerio_id AND (
            lider_id = get_current_person_id() OR is_admin()
        ))
    );

CREATE POLICY "Membros podem ver dados de seus ministérios" ON public.ministerio_membros
    FOR SELECT USING (
        pessoa_id = get_current_person_id() OR
        EXISTS(SELECT 1 FROM public.ministerios WHERE id = ministerio_membros.ministerio_id AND (
            lider_id = get_current_person_id() OR 
            is_admin() OR
            EXISTS(SELECT 1 FROM public.ministerio_membros mm WHERE mm.ministerio_id = ministerios.id AND mm.pessoa_id = get_current_person_id() AND mm.ativo = true)
        ))
    );

-- Políticas RLS para escalas_ministerio
CREATE POLICY "Líderes podem gerenciar escalas de seus ministérios" ON public.escalas_ministerio
    FOR ALL USING (
        EXISTS(SELECT 1 FROM public.ministerios WHERE id = escalas_ministerio.ministerio_id AND (
            lider_id = get_current_person_id() OR is_admin()
        ))
    );

CREATE POLICY "Membros podem ver escalas de seus ministérios" ON public.escalas_ministerio
    FOR SELECT USING (
        EXISTS(SELECT 1 FROM public.ministerios WHERE id = escalas_ministerio.ministerio_id AND (
            lider_id = get_current_person_id() OR 
            is_admin() OR
            EXISTS(SELECT 1 FROM public.ministerio_membros WHERE ministerio_id = ministerios.id AND pessoa_id = get_current_person_id() AND ativo = true)
        ))
    );

-- Políticas RLS para escala_participantes
CREATE POLICY "Acesso a participantes segue acesso à escala" ON public.escala_participantes
    FOR ALL USING (
        EXISTS(SELECT 1 FROM public.escalas_ministerio em 
               JOIN public.ministerios m ON m.id = em.ministerio_id
               WHERE em.id = escala_participantes.escala_id AND (
                   m.lider_id = get_current_person_id() OR is_admin()
               ))
    );

CREATE POLICY "Membros podem ver suas próprias convocações" ON public.escala_participantes
    FOR SELECT USING (
        EXISTS(SELECT 1 FROM public.ministerio_membros WHERE id = escala_participantes.membro_id AND pessoa_id = get_current_person_id())
    );

-- Políticas RLS para convites_ministerio
CREATE POLICY "Líderes podem gerenciar convites de seus ministérios" ON public.convites_ministerio
    FOR ALL USING (
        EXISTS(SELECT 1 FROM public.ministerios WHERE id = convites_ministerio.ministerio_id AND (
            lider_id = get_current_person_id() OR is_admin()
        ))
    );

-- Inserir alguns ministérios padrão
INSERT INTO public.ministerios (nome, descricao) VALUES 
('Louvor e Adoração', 'Ministério responsável pela música e adoração nos cultos'),
('Dança Profética', 'Ministério de dança e expressão corporal'),
('Mídia e Tecnologia', 'Ministério responsável por som, vídeo e transmissões'),
('Intercessão', 'Ministério de oração e intercessão'),
('Recepção e Hospitalidade', 'Ministério de acolhimento aos visitantes'),
('Teatro e Drama', 'Ministério de representações teatrais e dramáticas');

-- Inserir funções padrão para o ministério de Louvor
INSERT INTO public.ministerio_funcoes (ministerio_id, nome_funcao, descricao, nivel_experiencia, ordem)
SELECT 
    m.id,
    f.nome,
    f.descricao,
    f.nivel,
    f.ordem
FROM public.ministerios m
CROSS JOIN (VALUES 
    ('Vocalista Principal', 'Cantor(a) principal, responsável pelos solos', 'intermediario', 1),
    ('Backing Vocal', 'Apoio vocal, coros e harmonias', 'iniciante', 2),
    ('Violão/Guitarra', 'Instrumentista de cordas', 'intermediario', 3),
    ('Baixo', 'Baixista', 'intermediario', 4),
    ('Bateria', 'Baterista', 'avancado', 5),
    ('Teclado', 'Tecladista', 'intermediario', 6),
    ('Líder de Louvor', 'Responsável por dirigir o louvor', 'avancado', 0)
) AS f(nome, descricao, nivel, ordem)
WHERE m.nome = 'Louvor e Adoração';

-- Inserir funções para outros ministérios
INSERT INTO public.ministerio_funcoes (ministerio_id, nome_funcao, descricao, ordem)
SELECT m.id, f.nome, f.descricao, f.ordem
FROM public.ministerios m
CROSS JOIN (VALUES 
    ('Dançarino Principal', 'Líder da coreografia', 1),
    ('Dançarino', 'Participante da dança', 2)
) AS f(nome, descricao, ordem)
WHERE m.nome = 'Dança Profética';

INSERT INTO public.ministerio_funcoes (ministerio_id, nome_funcao, descricao, ordem)
SELECT m.id, f.nome, f.descricao, f.ordem
FROM public.ministerios m
CROSS JOIN (VALUES 
    ('Operador de Som', 'Responsável pela mesa de som', 1),
    ('Operador de Vídeo', 'Responsável pelas câmeras e projeção', 2),
    ('Streaming', 'Responsável pela transmissão online', 3)
) AS f(nome, descricao, ordem)
WHERE m.nome = 'Mídia e Tecnologia';

INSERT INTO public.ministerio_funcoes (ministerio_id, nome_funcao, descricao, ordem)
SELECT m.id, f.nome, f.descricao, f.ordem
FROM public.ministerios m
CROSS JOIN (VALUES 
    ('Intercessor', 'Responsável pela oração durante os cultos', 1),
    ('Líder de Oração', 'Coordena as orações', 2)
) AS f(nome, descricao, ordem)
WHERE m.nome = 'Intercessão';

INSERT INTO public.ministerio_funcoes (ministerio_id, nome_funcao, descricao, ordem)
SELECT m.id, f.nome, f.descricao, f.ordem
FROM public.ministerios m
CROSS JOIN (VALUES 
    ('Recepcionista', 'Acolhe os visitantes na entrada', 1),
    ('Anfitrião', 'Acompanha visitantes durante o culto', 2)
) AS f(nome, descricao, ordem)
WHERE m.nome = 'Recepção e Hospitalidade';

INSERT INTO public.ministerio_funcoes (ministerio_id, nome_funcao, descricao, ordem)
SELECT m.id, f.nome, f.descricao, f.ordem
FROM public.ministerios m
CROSS JOIN (VALUES 
    ('Ator Principal', 'Papel principal nas apresentações', 1),
    ('Ator Coadjuvante', 'Papel de apoio', 2),
    ('Diretor', 'Dirige as apresentações', 3)
) AS f(nome, descricao, ordem)
WHERE m.nome = 'Teatro e Drama';