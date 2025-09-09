-- === MIGRAÇÃO: Fundação do Headless CMS ===
-- Renomear a tabela existente para seguir a convenção
ALTER TABLE public.site_pages RENAME TO paginas_site;

-- Adicionar colunas faltantes na tabela de páginas
ALTER TABLE public.paginas_site 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'rascunho';

-- Atualizar páginas existentes para status 'publicado' se já estiverem published
UPDATE public.paginas_site SET status = 'publicado' WHERE published = true;

-- === TABELA 2: SEÇÕES DAS PÁGINAS ===
CREATE TABLE public.secoes_pagina (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pagina_id UUID NOT NULL REFERENCES public.paginas_site(id) ON DELETE CASCADE,
    tipo_secao TEXT NOT NULL, -- Para o Lovable saber qual componente renderizar
    ordem INTEGER NOT NULL DEFAULT 0, -- Para reordenar as seções na página
    status TEXT NOT NULL DEFAULT 'publicado', -- 'publicado' ou 'oculto'
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- === TABELA 3: BLOCOS DE CONTEÚDO ===
CREATE TABLE public.blocos_conteudo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secao_id UUID NOT NULL REFERENCES public.secoes_pagina(id) ON DELETE CASCADE,
    tipo_bloco TEXT NOT NULL, -- 'titulo', 'paragrafo', 'imagem', 'botao'
    conteudo_json JSONB, -- Conteúdo flexível
    ordem INTEGER NOT NULL DEFAULT 0, -- Para reordenar blocos dentro de uma seção
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- === COMENTÁRIOS PARA DOCUMENTAÇÃO ===
COMMENT ON TABLE public.paginas_site IS 'Define as páginas mestras do site público.';
COMMENT ON TABLE public.secoes_pagina IS 'Define e ordena as seções de conteúdo de cada página.';
COMMENT ON TABLE public.blocos_conteudo IS 'Armazena os pedaços de conteúdo editáveis de cada seção.';

-- === ATIVANDO A SEGURANÇA (RLS) ===
ALTER TABLE public.secoes_pagina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocos_conteudo ENABLE ROW LEVEL SECURITY;

-- === POLÍTICAS DE LEITURA PÚBLICA ===
CREATE POLICY "Leitura pública para seções publicadas" 
ON public.secoes_pagina FOR SELECT USING (status = 'publicado');

CREATE POLICY "Leitura pública para blocos de conteúdo" 
ON public.blocos_conteudo FOR SELECT USING (true);

-- === POLÍTICAS DE GESTÃO ADMIN ===
CREATE POLICY "Admins podem gerenciar seções" 
ON public.secoes_pagina FOR ALL USING (is_admin());

CREATE POLICY "Admins podem gerenciar blocos" 
ON public.blocos_conteudo FOR ALL USING (is_admin());

-- === TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA ===
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_secoes_pagina_updated_at
    BEFORE UPDATE ON public.secoes_pagina
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocos_conteudo_updated_at
    BEFORE UPDATE ON public.blocos_conteudo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();