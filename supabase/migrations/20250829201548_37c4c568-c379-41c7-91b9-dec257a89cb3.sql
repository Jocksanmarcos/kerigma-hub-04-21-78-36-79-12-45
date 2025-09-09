-- Schema da Bíblia: verificar e corrigir estrutura das tabelas

-- Criar tabela biblia_versoes se não existir
CREATE TABLE IF NOT EXISTS public.biblia_versoes (
  id text PRIMARY KEY,
  nome text NOT NULL,
  abreviacao text,
  descricao text,
  idioma text NOT NULL DEFAULT 'pt'
);

-- Verificar e adicionar colunas em biblia_livros
DO $$ BEGIN
  -- Criar tabela se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='biblia_livros') THEN
    CREATE TABLE public.biblia_livros (
      id text PRIMARY KEY,
      versao_id text NOT NULL,
      nome text NOT NULL,
      abreviacao text,
      testamento text,
      ordinal integer NOT NULL
    );
  ELSE
    -- Verificar e alterar tipo da coluna id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='id' AND data_type <> 'text'
    ) THEN
      ALTER TABLE public.biblia_livros ALTER COLUMN id TYPE text USING id::text;
    END IF;
    
    -- Adicionar coluna versao_id se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='versao_id'
    ) THEN
      ALTER TABLE public.biblia_livros ADD COLUMN versao_id text;
    ELSE
      -- Se existir, verificar tipo
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='versao_id' AND data_type <> 'text'
      ) THEN
        ALTER TABLE public.biblia_livros ALTER COLUMN versao_id TYPE text USING versao_id::text;
      END IF;
    END IF;
    
    -- Adicionar outras colunas se não existirem
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='nome'
    ) THEN
      ALTER TABLE public.biblia_livros ADD COLUMN nome text;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='abreviacao'
    ) THEN
      ALTER TABLE public.biblia_livros ADD COLUMN abreviacao text;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='testamento'
    ) THEN
      ALTER TABLE public.biblia_livros ADD COLUMN testamento text;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='ordinal'
    ) THEN
      ALTER TABLE public.biblia_livros ADD COLUMN ordinal integer;
    END IF;
  END IF;
END $$;

-- Verificar e adicionar colunas em biblia_versiculos
DO $$ BEGIN
  -- Criar tabela se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='biblia_versiculos') THEN
    CREATE TABLE public.biblia_versiculos (
      versao_id text NOT NULL,
      livro_id text NOT NULL,
      capitulo integer NOT NULL,
      versiculo integer NOT NULL,
      texto text NOT NULL,
      PRIMARY KEY (versao_id, livro_id, capitulo, versiculo)
    );
  ELSE
    -- Verificar e alterar tipos das colunas
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='versao_id' AND data_type <> 'text'
    ) THEN
      ALTER TABLE public.biblia_versiculos ALTER COLUMN versao_id TYPE text USING versao_id::text;
    END IF;
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='livro_id' AND data_type <> 'text'
    ) THEN
      ALTER TABLE public.biblia_versiculos ALTER COLUMN livro_id TYPE text USING livro_id::text;
    END IF;
    
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='versao_id'
    ) THEN
      ALTER TABLE public.biblia_versiculos ADD COLUMN versao_id text;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='livro_id'
    ) THEN
      ALTER TABLE public.biblia_versiculos ADD COLUMN livro_id text;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='capitulo'
    ) THEN
      ALTER TABLE public.biblia_versiculos ADD COLUMN capitulo integer;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='versiculo'
    ) THEN
      ALTER TABLE public.biblia_versiculos ADD COLUMN versiculo integer;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='texto'
    ) THEN
      ALTER TABLE public.biblia_versiculos ADD COLUMN texto text;
    END IF;
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.biblia_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblia_versiculos ENABLE ROW LEVEL SECURITY;

-- Criar políticas de RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='biblia_versoes' AND policyname='Todos podem ver versoes da biblia'
  ) THEN
    CREATE POLICY "Todos podem ver versoes da biblia" ON public.biblia_versoes FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='biblia_livros' AND policyname='Todos podem ver livros da biblia'
  ) THEN
    CREATE POLICY "Todos podem ver livros da biblia" ON public.biblia_livros FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='biblia_versiculos' AND policyname='Todos podem ver versiculos'
  ) THEN
    CREATE POLICY "Todos podem ver versiculos" ON public.biblia_versiculos FOR SELECT USING (true);
  END IF;
END $$;

-- Criar foreign key constraints apenas se as colunas existirem
DO $$ BEGIN
  -- FK biblia_livros -> biblia_versoes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='biblia_livros' AND column_name='versao_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema='public' AND table_name='biblia_livros' AND constraint_name='biblia_livros_versao_fk'
  ) THEN
    ALTER TABLE public.biblia_livros
      ADD CONSTRAINT biblia_livros_versao_fk FOREIGN KEY (versao_id)
      REFERENCES public.biblia_versoes(id) ON DELETE CASCADE;
  END IF;
  
  -- FK biblia_versiculos -> biblia_versoes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='versao_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema='public' AND table_name='biblia_versiculos' AND constraint_name='biblia_versiculos_versao_fk'
  ) THEN
    ALTER TABLE public.biblia_versiculos
      ADD CONSTRAINT biblia_versiculos_versao_fk FOREIGN KEY (versao_id)
      REFERENCES public.biblia_versoes(id) ON DELETE CASCADE;
  END IF;
  
  -- FK biblia_versiculos -> biblia_livros
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='biblia_versiculos' AND column_name='livro_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema='public' AND table_name='biblia_versiculos' AND constraint_name='biblia_versiculos_livro_fk'
  ) THEN
    ALTER TABLE public.biblia_versiculos
      ADD CONSTRAINT biblia_versiculos_livro_fk FOREIGN KEY (livro_id)
      REFERENCES public.biblia_livros(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Criar índices úteis
CREATE INDEX IF NOT EXISTS idx_bv_livro ON public.biblia_versiculos(livro_id, capitulo, versiculo);
CREATE INDEX IF NOT EXISTS idx_bl_versao ON public.biblia_livros(versao_id, ordinal);