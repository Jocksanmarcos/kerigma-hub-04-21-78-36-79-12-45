-- Criar tabelas para o módulo biblioteca completo

-- Tabela de livros/recursos da biblioteca
CREATE TABLE IF NOT EXISTS public.biblioteca_livros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT,
  isbn TEXT,
  editora TEXT,
  ano_publicacao INTEGER,
  numero_paginas INTEGER,
  capa_url TEXT,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'geral',
  assuntos TEXT[] DEFAULT ARRAY[]::TEXT[],
  tipo_formato TEXT NOT NULL DEFAULT 'fisico', -- 'fisico', 'digital', 'ambos'
  arquivo_digital_url TEXT, -- URL do PDF/ebook se digital
  localizacao TEXT, -- sede, missao1, missao2, etc
  codigo_catalogo TEXT UNIQUE,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  quantidade_total INTEGER NOT NULL DEFAULT 1,
  quantidade_disponivel INTEGER NOT NULL DEFAULT 1,
  destaque BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  church_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de empréstimos
CREATE TABLE IF NOT EXISTS public.biblioteca_emprestimos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livro_id UUID NOT NULL REFERENCES public.biblioteca_livros(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
  data_devolucao_prevista DATE NOT NULL,
  data_devolucao_real DATE,
  status TEXT NOT NULL DEFAULT 'Ativo', -- 'Ativo', 'Devolvido', 'Atrasado', 'Perdido'
  observacoes TEXT,
  multa_valor DECIMAL(10,2) DEFAULT 0,
  aprovado_por UUID REFERENCES public.pessoas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de reservas
CREATE TABLE IF NOT EXISTS public.biblioteca_reservas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livro_id UUID NOT NULL REFERENCES public.biblioteca_livros(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data_reserva TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  status TEXT DEFAULT 'Ativa', -- 'Ativa', 'Cancelada', 'Atendida'
  notificado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de resenhas e avaliações
CREATE TABLE IF NOT EXISTS public.biblioteca_resenhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livro_id UUID NOT NULL REFERENCES public.biblioteca_livros(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  nota INTEGER CHECK (nota >= 1 AND nota <= 5),
  aprovada BOOLEAN DEFAULT false,
  moderada_por UUID REFERENCES public.pessoas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de categorias da biblioteca
CREATE TABLE IF NOT EXISTS public.biblioteca_categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cor TEXT DEFAULT '#3b82f6',
  icone TEXT DEFAULT 'book',
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de leituras/acessos digitais
CREATE TABLE IF NOT EXISTS public.biblioteca_leituras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livro_id UUID NOT NULL REFERENCES public.biblioteca_livros(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data_acesso TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tempo_leitura_minutos INTEGER DEFAULT 0,
  progresso_percentual INTEGER DEFAULT 0 CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
  concluida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de estatísticas da biblioteca
CREATE TABLE IF NOT EXISTS public.biblioteca_estatisticas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  livro_id UUID NOT NULL REFERENCES public.biblioteca_livros(id) ON DELETE CASCADE,
  total_emprestimos INTEGER DEFAULT 0,
  total_reservas INTEGER DEFAULT 0,
  total_leituras_digitais INTEGER DEFAULT 0,
  total_resenhas INTEGER DEFAULT 0,
  media_avaliacao DECIMAL(3,2) DEFAULT 0,
  ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.biblioteca_categorias (nome, descricao, cor, icone, ordem) VALUES
  ('Discipulado', 'Livros sobre discipulado cristão', '#22c55e', 'users', 1),
  ('Evangelismo', 'Materiais para evangelização', '#f97316', 'megaphone', 2),
  ('Oração', 'Livros sobre vida de oração', '#8b5cf6', 'pray', 3),
  ('Teologia', 'Estudos teológicos e doutrinários', '#3b82f6', 'book-open', 4),
  ('Biografia', 'Biografias de servos de Deus', '#ec4899', 'user', 5),
  ('Família', 'Relacionamentos e vida familiar', '#14b8a6', 'heart', 6),
  ('Liderança', 'Desenvolvimento de líderes', '#f59e0b', 'crown', 7),
  ('Juvenil', 'Livros para jovens', '#06b6d4', 'users-2', 8),
  ('Infantil', 'Livros para crianças', '#84cc16', 'baby', 9),
  ('Geral', 'Outros assuntos cristãos', '#6b7280', 'book', 10)
ON CONFLICT (nome) DO NOTHING;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.biblioteca_livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_resenhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_leituras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_estatisticas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para biblioteca_livros
CREATE POLICY "Livros são visíveis para todos os usuários autenticados" 
ON public.biblioteca_livros FOR SELECT 
TO authenticated USING (ativo = true);

CREATE POLICY "Admins podem gerenciar livros" 
ON public.biblioteca_livros FOR ALL 
TO authenticated USING (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Políticas RLS para biblioteca_emprestimos
CREATE POLICY "Usuários podem ver próprios empréstimos" 
ON public.biblioteca_emprestimos FOR SELECT 
TO authenticated USING (
  EXISTS (SELECT 1 FROM pessoas WHERE pessoas.id = biblioteca_emprestimos.pessoa_id AND pessoas.user_id = auth.uid())
  OR is_admin() 
  OR user_has_permission('read', 'biblioteca')
);

CREATE POLICY "Admins podem gerenciar empréstimos" 
ON public.biblioteca_emprestimos FOR ALL 
TO authenticated USING (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Políticas RLS para biblioteca_reservas  
CREATE POLICY "Usuários podem ver próprias reservas" 
ON public.biblioteca_reservas FOR SELECT 
TO authenticated USING (
  EXISTS (SELECT 1 FROM pessoas WHERE pessoas.id = biblioteca_reservas.pessoa_id AND pessoas.user_id = auth.uid())
  OR is_admin() 
  OR user_has_permission('read', 'biblioteca')
);

CREATE POLICY "Usuários podem criar reservas" 
ON public.biblioteca_reservas FOR INSERT 
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM pessoas WHERE pessoas.id = biblioteca_reservas.pessoa_id AND pessoas.user_id = auth.uid())
);

CREATE POLICY "Admins podem gerenciar reservas" 
ON public.biblioteca_reservas FOR ALL 
TO authenticated USING (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Políticas RLS para biblioteca_resenhas
CREATE POLICY "Resenhas aprovadas são visíveis para todos" 
ON public.biblioteca_resenhas FOR SELECT 
TO authenticated USING (aprovada = true OR 
  EXISTS (SELECT 1 FROM pessoas WHERE pessoas.id = biblioteca_resenhas.pessoa_id AND pessoas.user_id = auth.uid())
  OR is_admin() OR user_has_permission('read', 'biblioteca')
);

CREATE POLICY "Usuários podem criar resenhas" 
ON public.biblioteca_resenhas FOR INSERT 
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM pessoas WHERE pessoas.id = biblioteca_resenhas.pessoa_id AND pessoas.user_id = auth.uid())
);

CREATE POLICY "Admins podem gerenciar resenhas" 
ON public.biblioteca_resenhas FOR ALL 
TO authenticated USING (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Políticas RLS para biblioteca_categorias
CREATE POLICY "Categorias ativas são visíveis para todos" 
ON public.biblioteca_categorias FOR SELECT 
TO authenticated USING (ativa = true);

CREATE POLICY "Admins podem gerenciar categorias" 
ON public.biblioteca_categorias FOR ALL 
TO authenticated USING (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Políticas RLS para biblioteca_leituras
CREATE POLICY "Usuários podem ver próprias leituras" 
ON public.biblioteca_leituras FOR SELECT 
TO authenticated USING (
  EXISTS (SELECT 1 FROM pessoas WHERE pessoas.id = biblioteca_leituras.pessoa_id AND pessoas.user_id = auth.uid())
  OR is_admin() OR user_has_permission('read', 'biblioteca')
);

CREATE POLICY "Usuários podem registrar leituras" 
ON public.biblioteca_leituras FOR INSERT 
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM pessoas WHERE pessoas.id = biblioteca_leituras.pessoa_id AND pessoas.user_id = auth.uid())
);

CREATE POLICY "Usuários podem atualizar próprias leituras" 
ON public.biblioteca_leituras FOR UPDATE 
TO authenticated USING (
  EXISTS (SELECT 1 FROM pessoas WHERE pessoas.id = biblioteca_leituras.pessoa_id AND pessoas.user_id = auth.uid())
);

-- Políticas RLS para biblioteca_estatisticas
CREATE POLICY "Estatísticas são visíveis para todos autenticados" 
ON public.biblioteca_estatisticas FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Sistema pode gerenciar estatísticas" 
ON public.biblioteca_estatisticas FOR ALL 
TO authenticated USING (is_admin() OR user_has_permission('manage', 'biblioteca'));

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_biblioteca_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_biblioteca_livros_updated_at
  BEFORE UPDATE ON public.biblioteca_livros
  FOR EACH ROW EXECUTE FUNCTION public.update_biblioteca_updated_at();

CREATE TRIGGER update_biblioteca_emprestimos_updated_at
  BEFORE UPDATE ON public.biblioteca_emprestimos
  FOR EACH ROW EXECUTE FUNCTION public.update_biblioteca_updated_at();

CREATE TRIGGER update_biblioteca_resenhas_updated_at
  BEFORE UPDATE ON public.biblioteca_resenhas
  FOR EACH ROW EXECUTE FUNCTION public.update_biblioteca_updated_at();

CREATE TRIGGER update_biblioteca_leituras_updated_at
  BEFORE UPDATE ON public.biblioteca_leituras
  FOR EACH ROW EXECUTE FUNCTION public.update_biblioteca_updated_at();

-- Função para atualizar estatísticas
CREATE OR REPLACE FUNCTION public.atualizar_estatisticas_livro(livro_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.biblioteca_estatisticas (livro_id, total_emprestimos, total_reservas, total_leituras_digitais, total_resenhas, media_avaliacao)
  SELECT 
    livro_uuid,
    COALESCE((SELECT COUNT(*) FROM biblioteca_emprestimos WHERE livro_id = livro_uuid), 0),
    COALESCE((SELECT COUNT(*) FROM biblioteca_reservas WHERE livro_id = livro_uuid), 0),
    COALESCE((SELECT COUNT(*) FROM biblioteca_leituras WHERE livro_id = livro_uuid), 0),
    COALESCE((SELECT COUNT(*) FROM biblioteca_resenhas WHERE livro_id = livro_uuid AND aprovada = true), 0),
    COALESCE((SELECT AVG(nota) FROM biblioteca_resenhas WHERE livro_id = livro_uuid AND aprovada = true), 0)
  ON CONFLICT (livro_id) 
  DO UPDATE SET
    total_emprestimos = EXCLUDED.total_emprestimos,
    total_reservas = EXCLUDED.total_reservas,
    total_leituras_digitais = EXCLUDED.total_leituras_digitais,
    total_resenhas = EXCLUDED.total_resenhas,
    media_avaliacao = EXCLUDED.media_avaliacao,
    ultima_atualizacao = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;