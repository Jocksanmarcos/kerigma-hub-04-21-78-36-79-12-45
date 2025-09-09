-- Criar tabelas para estrutura da Bíblia
CREATE TABLE public.biblia_versoes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  abreviacao TEXT NOT NULL,
  descricao TEXT,
  idioma TEXT DEFAULT 'pt',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.biblia_livros (
  id TEXT PRIMARY KEY,
  versao_id TEXT NOT NULL REFERENCES public.biblia_versoes(id),
  nome TEXT NOT NULL,
  abreviacao TEXT,
  testamento TEXT CHECK (testamento IN ('AT', 'NT')),
  ordinal INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_biblia_livros_versao_id ON public.biblia_livros(versao_id);
CREATE INDEX idx_biblia_livros_testamento ON public.biblia_livros(testamento);
CREATE INDEX idx_biblia_livros_ordinal ON public.biblia_livros(ordinal);

-- Habilitar RLS
ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - permitir leitura para todos os usuários autenticados
CREATE POLICY "Usuários podem visualizar versões da Bíblia" 
ON public.biblia_versoes FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem visualizar livros da Bíblia" 
ON public.biblia_livros FOR SELECT 
USING (auth.role() = 'authenticated');

-- Políticas para administradores gerenciarem dados
CREATE POLICY "Administradores podem gerenciar versões" 
ON public.biblia_versoes FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

CREATE POLICY "Administradores podem gerenciar livros" 
ON public.biblia_livros FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());