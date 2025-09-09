-- Criar tabela de versões da Bíblia se não existir
CREATE TABLE IF NOT EXISTS public.biblia_versoes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  abreviacao TEXT NOT NULL,
  codigo_versao TEXT NOT NULL,
  descricao TEXT,
  editora TEXT,
  ano_publicacao INTEGER,
  idioma TEXT DEFAULT 'pt-BR',
  ativa BOOLEAN DEFAULT true,
  ordem_exibicao INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de livros da Bíblia se não existir
CREATE TABLE IF NOT EXISTS public.biblia_livros (
  id TEXT PRIMARY KEY,
  versao_id TEXT NOT NULL,
  nome TEXT NOT NULL,
  nome_portugues TEXT,
  abreviacao TEXT NOT NULL,
  testamento TEXT NOT NULL CHECK (testamento IN ('AT', 'NT')),
  total_capitulos INTEGER,
  ordinal INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de versículos da Bíblia se não existir
CREATE TABLE IF NOT EXISTS public.biblia_versiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  versao_id TEXT NOT NULL,
  livro_id TEXT NOT NULL,
  capitulo INTEGER NOT NULL,
  versiculo INTEGER NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(versao_id, livro_id, capitulo, versiculo)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_biblia_versiculos_versao_livro_capitulo 
ON public.biblia_versiculos(versao_id, livro_id, capitulo);

CREATE INDEX IF NOT EXISTS idx_biblia_livros_versao 
ON public.biblia_livros(versao_id);

-- Habilitar RLS
ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;

-- Políticas para versões
CREATE POLICY "Qualquer um pode ver versões ativas" 
ON public.biblia_versoes 
FOR SELECT 
USING (ativa = true);

CREATE POLICY "Admins podem gerenciar versões da Bíblia" 
ON public.biblia_versoes 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Políticas para livros
CREATE POLICY "Qualquer um pode ver livros da Bíblia" 
ON public.biblia_livros 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem gerenciar livros da Bíblia" 
ON public.biblia_livros 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Políticas para versículos
CREATE POLICY "Qualquer um pode ver versículos da Bíblia" 
ON public.biblia_versiculos 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem gerenciar versículos da Bíblia" 
ON public.biblia_versiculos 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Inserir versões iniciais do Brasil
INSERT INTO public.biblia_versoes (id, nome, abreviacao, codigo_versao, descricao, editora, ano_publicacao, ordem_exibicao) VALUES
('arc', 'Almeida Revista e Corrigida', 'ARC', 'ARC', 'Almeida Revista e Corrigida - Português do Brasil', 'Sociedade Bíblica do Brasil', 1995, 1),
('ara', 'Almeida Revista e Atualizada', 'ARA', 'ARA', 'Almeida Revista e Atualizada - Português do Brasil', 'Sociedade Bíblica do Brasil', 1993, 2),
('nvi', 'Nova Versão Internacional', 'NVI', 'NVI', 'Nova Versão Internacional - Português do Brasil', 'Sociedade Bíblica Internacional', 2000, 3),
('ntlh', 'Nova Tradução na Linguagem de Hoje', 'NTLH', 'NTLH', 'Nova Tradução na Linguagem de Hoje - Português do Brasil', 'Sociedade Bíblica do Brasil', 2000, 4)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  abreviacao = EXCLUDED.abreviacao,
  codigo_versao = EXCLUDED.codigo_versao,
  descricao = EXCLUDED.descricao,
  editora = EXCLUDED.editora,
  ano_publicacao = EXCLUDED.ano_publicacao,
  ordem_exibicao = EXCLUDED.ordem_exibicao;