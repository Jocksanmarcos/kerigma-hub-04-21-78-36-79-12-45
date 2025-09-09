-- Estratégia diferente: recriar tabelas da Bíblia com IDs corretos

-- 1. Fazer backup dos dados existentes (se houver)
CREATE TEMP TABLE temp_biblia_versoes AS 
SELECT * FROM public.biblia_versoes WHERE false; -- estrutura apenas

CREATE TEMP TABLE temp_biblia_livros AS 
SELECT * FROM public.biblia_livros WHERE false;

CREATE TEMP TABLE temp_biblia_versiculos AS 
SELECT * FROM public.biblia_versiculos WHERE false;

-- 2. Dropar tabelas existentes (com cascade para remover constraints)
DROP TABLE IF EXISTS public.biblia_versiculos CASCADE;
DROP TABLE IF EXISTS public.biblia_livros CASCADE;
DROP TABLE IF EXISTS public.biblia_versoes CASCADE;

-- 3. Recriar com estrutura correta
CREATE TABLE public.biblia_versoes (
  id text PRIMARY KEY,
  nome text NOT NULL,
  abreviacao text,
  descricao text,
  idioma text NOT NULL DEFAULT 'pt'
);

CREATE TABLE public.biblia_livros (
  id text PRIMARY KEY,
  versao_id text NOT NULL,
  nome text NOT NULL,
  abreviacao text,
  testamento text,
  ordinal integer NOT NULL,
  CONSTRAINT biblia_livros_versao_fk FOREIGN KEY (versao_id)
    REFERENCES public.biblia_versoes(id) ON DELETE CASCADE
);

CREATE TABLE public.biblia_versiculos (
  versao_id text NOT NULL,
  livro_id text NOT NULL,
  capitulo integer NOT NULL,
  versiculo integer NOT NULL,
  texto text NOT NULL,
  PRIMARY KEY (versao_id, livro_id, capitulo, versiculo),
  CONSTRAINT biblia_versiculos_versao_fk FOREIGN KEY (versao_id)
    REFERENCES public.biblia_versoes(id) ON DELETE CASCADE,
  CONSTRAINT biblia_versiculos_livro_fk FOREIGN KEY (livro_id)
    REFERENCES public.biblia_livros(id) ON DELETE CASCADE
);

-- 4. Habilitar RLS e criar políticas
ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver versoes da biblia" ON public.biblia_versoes FOR SELECT USING (true);
CREATE POLICY "Todos podem ver livros da biblia" ON public.biblia_livros FOR SELECT USING (true);
CREATE POLICY "Todos podem ver versiculos" ON public.biblia_versiculos FOR SELECT USING (true);

-- 5. Criar índices úteis
CREATE INDEX idx_bv_livro ON public.biblia_versiculos(livro_id, capitulo, versiculo);
CREATE INDEX idx_bl_versao ON public.biblia_livros(versao_id, ordinal);

-- Limpar tabelas temporárias
DROP TABLE IF EXISTS temp_biblia_versoes;
DROP TABLE IF EXISTS temp_biblia_livros;
DROP TABLE IF EXISTS temp_biblia_versiculos;