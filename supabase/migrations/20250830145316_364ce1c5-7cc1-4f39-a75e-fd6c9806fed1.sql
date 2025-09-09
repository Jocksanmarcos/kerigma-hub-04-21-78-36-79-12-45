-- Melhorar a estrutura das tabelas da Bíblia para suportar múltiplas versões

-- Atualizar tabela biblia_versoes para incluir mais campos
ALTER TABLE IF EXISTS public.biblia_versoes 
ADD COLUMN IF NOT EXISTS codigo_versao TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS editora TEXT,
ADD COLUMN IF NOT EXISTS ano_publicacao INTEGER,
ADD COLUMN IF NOT EXISTS copyright_info TEXT,
ADD COLUMN IF NOT EXISTS ativa BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS ordem_exibicao INTEGER DEFAULT 0;

-- Inserir as novas versões da Bíblia solicitadas
INSERT INTO public.biblia_versoes (id, nome, abreviacao, codigo_versao, descricao, idioma, editora, ano_publicacao, ativa, ordem_exibicao) VALUES
('arc', 'Almeida Revista e Corrigida', 'ARC', 'ARC', 'Versão tradicional e amplamente conhecida', 'pt', 'Sociedade Bíblica do Brasil', 1995, true, 1),
('ara', 'Almeida Revista e Atualizada', 'ARA', 'ARA', 'Versão com linguagem atualizada', 'pt', 'Sociedade Bíblica do Brasil', 1993, true, 2),
('nvi', 'Nova Versão Internacional', 'NVI', 'NVI', 'Tradução moderna e dinâmica', 'pt', 'Editora Vida', 2000, true, 3),
('ntlh', 'Nova Tradução na Linguagem de Hoje', 'NTLH', 'NTLH', 'Linguagem simples e atual', 'pt', 'Sociedade Bíblica do Brasil', 2000, true, 4),
('kjv', 'King James Version', 'KJV', 'KJ', 'Versão clássica em inglês', 'en', 'Cambridge University Press', 1611, true, 5),
('bible-com-pt', 'Bíblia (Bible API)', 'ACF', 'ACF', 'Almeida Corrigida Fiel - Fonte: bible-api.com', 'pt', 'Bible API', 2000, true, 6)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  abreviacao = EXCLUDED.abreviacao,
  codigo_versao = EXCLUDED.codigo_versao,
  descricao = EXCLUDED.descricao,
  editora = EXCLUDED.editora,
  ano_publicacao = EXCLUDED.ano_publicacao,
  ativa = EXCLUDED.ativa,
  ordem_exibicao = EXCLUDED.ordem_exibicao;

-- Atualizar tabela biblia_livros para melhorar relacionamentos
ALTER TABLE IF EXISTS public.biblia_livros
ADD COLUMN IF NOT EXISTS nome_original TEXT,
ADD COLUMN IF NOT EXISTS nome_portugues TEXT,
ADD COLUMN IF NOT EXISTS codigo_osis TEXT,
ADD COLUMN IF NOT EXISTS genero_literario TEXT,
ADD COLUMN IF NOT EXISTS total_capitulos INTEGER DEFAULT 0;

-- Atualizar tabela biblia_versiculos para melhor indexação
CREATE INDEX IF NOT EXISTS idx_biblia_versiculos_busca_texto ON public.biblia_versiculos USING gin(to_tsvector('portuguese', texto));
CREATE INDEX IF NOT EXISTS idx_biblia_versiculos_versao_livro ON public.biblia_versiculos (versao_id, livro_id);
CREATE INDEX IF NOT EXISTS idx_biblia_versiculos_capitulo ON public.biblia_versiculos (versao_id, livro_id, capitulo);

-- Tabela para armazenar preferências do usuário sobre versões bíblicas
CREATE TABLE IF NOT EXISTS public.biblia_preferencias_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    versao_preferida TEXT REFERENCES public.biblia_versoes(id) DEFAULT 'arc',
    mostrar_numeros_versiculos BOOLEAN DEFAULT true,
    tamanho_fonte TEXT DEFAULT 'medio',
    tema_leitura TEXT DEFAULT 'claro',
    versoes_paralelas TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- RLS para preferências do usuário
ALTER TABLE public.biblia_preferencias_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas preferências bíblicas"
ON public.biblia_preferencias_usuario
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Tabela para histórico de leitura bíblica
CREATE TABLE IF NOT EXISTS public.biblia_historico_leitura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    versao_id TEXT REFERENCES public.biblia_versoes(id),
    livro_id TEXT NOT NULL,
    capitulo INTEGER NOT NULL,
    tempo_leitura_segundos INTEGER DEFAULT 0,
    data_leitura TIMESTAMP WITH TIME ZONE DEFAULT now(),
    dispositivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para histórico de leitura
ALTER TABLE public.biblia_historico_leitura ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu histórico de leitura"
ON public.biblia_historico_leitura
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem registrar leitura"
ON public.biblia_historico_leitura
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Índices para performance do histórico
CREATE INDEX IF NOT EXISTS idx_biblia_historico_user_date ON public.biblia_historico_leitura (user_id, data_leitura DESC);
CREATE INDEX IF NOT EXISTS idx_biblia_historico_livro ON public.biblia_historico_leitura (versao_id, livro_id, capitulo);

-- Atualizar triggers
DROP TRIGGER IF EXISTS trg_biblia_preferencias_updated_at ON public.biblia_preferencias_usuario;
CREATE TRIGGER trg_biblia_preferencias_updated_at
    BEFORE UPDATE ON public.biblia_preferencias_usuario
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_trigger();