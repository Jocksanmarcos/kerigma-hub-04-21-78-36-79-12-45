-- Criar tabela de livros da biblioteca
CREATE TABLE IF NOT EXISTS public.biblioteca_livros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT,
  editora TEXT,
  isbn TEXT UNIQUE,
  ano_publicacao INTEGER,
  numero_copias INTEGER DEFAULT 1,
  numero_paginas INTEGER,
  categoria TEXT,
  imagem_capa_url TEXT,
  sinopse TEXT,
  localizacao_fisica TEXT,
  qr_code_interno TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  status TEXT DEFAULT 'Disponível' 
    CHECK (status IN ('Disponível', 'Emprestado', 'Reservado', 'Em Manutenção')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de empréstimos
CREATE TABLE IF NOT EXISTS public.biblioteca_emprestimos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livro_id UUID NOT NULL REFERENCES public.biblioteca_livros(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data_emprestimo DATE DEFAULT CURRENT_DATE,
  data_devolucao_prevista DATE NOT NULL,
  data_devolucao_real DATE,
  observacoes TEXT,
  status TEXT DEFAULT 'Ativo' 
    CHECK (status IN ('Ativo', 'Devolvido', 'Atrasado', 'Renovado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de reservas
CREATE TABLE IF NOT EXISTS public.biblioteca_reservas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livro_id UUID NOT NULL REFERENCES public.biblioteca_livros(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data_reserva TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  status TEXT DEFAULT 'Ativa' 
    CHECK (status IN ('Ativa', 'Cancelada', 'Atendida', 'Expirada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.biblioteca_livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_reservas ENABLE ROW LEVEL SECURITY;

-- Políticas para biblioteca_livros
CREATE POLICY "Todos podem ver livros ativos" ON public.biblioteca_livros
  FOR SELECT USING (ativo = true);

CREATE POLICY "Admins podem gerenciar livros" ON public.biblioteca_livros
  FOR ALL USING (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Políticas para biblioteca_emprestimos
CREATE POLICY "Usuários podem ver próprios empréstimos" ON public.biblioteca_emprestimos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pessoas WHERE pessoas.id = biblioteca_emprestimos.pessoa_id AND pessoas.user_id = auth.uid())
    OR is_admin() 
    OR user_has_permission('read', 'biblioteca')
  );

CREATE POLICY "Admins podem gerenciar empréstimos" ON public.biblioteca_emprestimos
  FOR ALL USING (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Políticas para biblioteca_reservas
CREATE POLICY "Usuários podem ver próprias reservas" ON public.biblioteca_reservas
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pessoas WHERE pessoas.id = biblioteca_reservas.pessoa_id AND pessoas.user_id = auth.uid())
    OR is_admin() 
    OR user_has_permission('read', 'biblioteca')
  );

CREATE POLICY "Usuários podem criar reservas" ON public.biblioteca_reservas
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.pessoas WHERE pessoas.id = biblioteca_reservas.pessoa_id AND pessoas.user_id = auth.uid())
  );

CREATE POLICY "Admins podem gerenciar reservas" ON public.biblioteca_reservas
  FOR ALL USING (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_biblioteca_livros_isbn ON public.biblioteca_livros(isbn);
CREATE INDEX IF NOT EXISTS idx_biblioteca_livros_status ON public.biblioteca_livros(status);
CREATE INDEX IF NOT EXISTS idx_biblioteca_emprestimos_livro ON public.biblioteca_emprestimos(livro_id);
CREATE INDEX IF NOT EXISTS idx_biblioteca_emprestimos_pessoa ON public.biblioteca_emprestimos(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_biblioteca_emprestimos_status ON public.biblioteca_emprestimos(status);
CREATE INDEX IF NOT EXISTS idx_biblioteca_reservas_livro ON public.biblioteca_reservas(livro_id);
CREATE INDEX IF NOT EXISTS idx_biblioteca_reservas_pessoa ON public.biblioteca_reservas(pessoa_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_biblioteca_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_biblioteca_livros_updated_at
  BEFORE UPDATE ON public.biblioteca_livros
  FOR EACH ROW EXECUTE FUNCTION update_biblioteca_updated_at();

CREATE TRIGGER update_biblioteca_emprestimos_updated_at
  BEFORE UPDATE ON public.biblioteca_emprestimos
  FOR EACH ROW EXECUTE FUNCTION update_biblioteca_updated_at();

-- Função para atualizar status de empréstimos atrasados
CREATE OR REPLACE FUNCTION atualizar_emprestimos_atrasados()
RETURNS void AS $$
BEGIN
  UPDATE public.biblioteca_emprestimos 
  SET status = 'Atrasado'
  WHERE status = 'Ativo' 
    AND data_devolucao_prevista < CURRENT_DATE 
    AND data_devolucao_real IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;