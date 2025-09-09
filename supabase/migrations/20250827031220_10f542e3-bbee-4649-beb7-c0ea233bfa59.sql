-- Criar tabelas para o módulo de Gestão de Conteúdo

-- Tabela para comunicados
CREATE TABLE IF NOT EXISTS public.comunicados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  destacar BOOLEAN NOT NULL DEFAULT false,
  visibilidade TEXT NOT NULL DEFAULT 'membros' CHECK (visibilidade IN ('publico', 'membros', 'lideres')),
  imagem_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para banners da home
CREATE TABLE IF NOT EXISTS public.banners_home (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  imagem_url TEXT NOT NULL,
  link_url TEXT,
  link_texto TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_inicio DATE,
  data_fim DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para palavra da semana
CREATE TABLE IF NOT EXISTS public.palavra_semana (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  versiculo TEXT NOT NULL,
  referencia TEXT NOT NULL,
  reflexao TEXT,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners_home ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palavra_semana ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comunicados
CREATE POLICY "Pastores podem gerenciar comunicados" ON public.comunicados
  FOR ALL 
  USING (user_has_permission(auth.uid(), 'manage', 'content'))
  WITH CHECK (user_has_permission(auth.uid(), 'manage', 'content'));

CREATE POLICY "Membros podem ver comunicados ativos" ON public.comunicados
  FOR SELECT 
  USING (
    ativo = true AND 
    (data_fim IS NULL OR data_fim >= CURRENT_DATE) AND
    data_inicio <= CURRENT_DATE AND
    (
      visibilidade = 'publico' OR
      (visibilidade = 'membros' AND auth.role() = 'authenticated') OR
      (visibilidade = 'lideres' AND user_has_permission(auth.uid(), 'read', 'admin'))
    )
  );

-- Políticas RLS para banners
CREATE POLICY "Pastores podem gerenciar banners" ON public.banners_home
  FOR ALL 
  USING (user_has_permission(auth.uid(), 'manage', 'content'))
  WITH CHECK (user_has_permission(auth.uid(), 'manage', 'content'));

CREATE POLICY "Todos podem ver banners ativos" ON public.banners_home
  FOR SELECT 
  USING (
    ativo = true AND 
    (data_fim IS NULL OR data_fim >= CURRENT_DATE) AND
    (data_inicio IS NULL OR data_inicio <= CURRENT_DATE)
  );

-- Políticas RLS para palavra da semana
CREATE POLICY "Pastores podem gerenciar palavra da semana" ON public.palavra_semana
  FOR ALL 
  USING (user_has_permission(auth.uid(), 'manage', 'content'))
  WITH CHECK (user_has_permission(auth.uid(), 'manage', 'content'));

CREATE POLICY "Todos podem ver palavra da semana ativa" ON public.palavra_semana
  FOR SELECT 
  USING (
    ativo = true AND 
    (data_fim IS NULL OR data_fim >= CURRENT_DATE) AND
    data_inicio <= CURRENT_DATE
  );

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comunicados_updated_at
  BEFORE UPDATE ON public.comunicados
  FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();

CREATE TRIGGER update_banners_home_updated_at
  BEFORE UPDATE ON public.banners_home
  FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();

CREATE TRIGGER update_palavra_semana_updated_at
  BEFORE UPDATE ON public.palavra_semana
  FOR EACH ROW EXECUTE FUNCTION public.update_content_updated_at();

-- Inserir permissões para gestão de conteúdo
INSERT INTO public.permissions (action, subject, resource_type, description) VALUES
  ('create', 'content', 'comunicados', 'Criar comunicados'),
  ('read', 'content', 'comunicados', 'Visualizar comunicados'),
  ('update', 'content', 'comunicados', 'Editar comunicados'),
  ('delete', 'content', 'comunicados', 'Excluir comunicados'),
  ('manage', 'content', 'banners', 'Gerenciar banners da home'),
  ('manage', 'content', 'palavra_semana', 'Gerenciar palavra da semana'),
  ('manage', 'content', null, 'Gestão completa de conteúdo')
ON CONFLICT (action, subject, resource_type) DO NOTHING;