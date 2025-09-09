-- Criar estrutura completa da Bíblia no banco de dados
-- Tabela para versões da Bíblia
CREATE TABLE IF NOT EXISTS public.biblia_versoes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  abreviacao TEXT NOT NULL,
  descricao TEXT,
  idioma TEXT NOT NULL DEFAULT 'pt',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para livros da Bíblia
CREATE TABLE IF NOT EXISTS public.biblia_livros (
  id TEXT PRIMARY KEY,
  versao_id TEXT NOT NULL REFERENCES public.biblia_versoes(id),
  nome TEXT NOT NULL,
  abreviacao TEXT NOT NULL,
  testamento TEXT NOT NULL CHECK (testamento IN ('AT', 'NT')),
  ordinal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para capítulos
CREATE TABLE IF NOT EXISTS public.biblia_capitulos (
  id TEXT PRIMARY KEY,
  livro_id TEXT NOT NULL REFERENCES public.biblia_livros(id),
  versao_id TEXT NOT NULL REFERENCES public.biblia_versoes(id),
  numero INTEGER NOT NULL,
  titulo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(livro_id, versao_id, numero)
);

-- Tabela para versículos
CREATE TABLE IF NOT EXISTS public.biblia_versiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  versao_id TEXT NOT NULL REFERENCES public.biblia_versoes(id),
  livro_id TEXT NOT NULL REFERENCES public.biblia_livros(id),
  capitulo INTEGER NOT NULL,
  versiculo INTEGER NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(versao_id, livro_id, capitulo, versiculo)
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_biblia_versiculos_versao_livro_capitulo 
ON public.biblia_versiculos(versao_id, livro_id, capitulo);

CREATE INDEX IF NOT EXISTS idx_biblia_livros_versao_ordinal 
ON public.biblia_livros(versao_id, ordinal);

-- RLS Policies
ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_capitulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura pública
CREATE POLICY "Qualquer um pode ver versões da Bíblia" 
ON public.biblia_versoes FOR SELECT USING (true);

CREATE POLICY "Qualquer um pode ver livros da Bíblia" 
ON public.biblia_livros FOR SELECT USING (true);

CREATE POLICY "Qualquer um pode ver capítulos da Bíblia" 
ON public.biblia_capitulos FOR SELECT USING (true);

CREATE POLICY "Qualquer um pode ver versículos da Bíblia" 
ON public.biblia_versiculos FOR SELECT USING (true);

-- Políticas para admins gerenciarem
CREATE POLICY "Admins podem gerenciar versões da Bíblia" 
ON public.biblia_versoes FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins podem gerenciar livros da Bíblia" 
ON public.biblia_livros FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins podem gerenciar capítulos da Bíblia" 
ON public.biblia_capitulos FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins podem gerenciar versículos da Bíblia" 
ON public.biblia_versiculos FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Inserir uma versão padrão da Bíblia
INSERT INTO public.biblia_versoes (id, nome, abreviacao, descricao, idioma) 
VALUES ('bible-com-pt', 'Bíblia (Portuguese)', 'ACF', 'Almeida Corrigida Fiel', 'pt')
ON CONFLICT (id) DO NOTHING;