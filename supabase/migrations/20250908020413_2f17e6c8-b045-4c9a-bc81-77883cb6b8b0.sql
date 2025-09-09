-- Criação das tabelas do Headless CMS para Editor de Site Ao Vivo

-- Tabela para as páginas do site
CREATE TABLE public.site_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Tabela para as seções das páginas
CREATE TABLE public.page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.site_pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'hero', 'content', 'features', 'testimonials', etc.
  section_order INTEGER NOT NULL DEFAULT 0,
  section_config JSONB DEFAULT '{}',
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para os blocos de conteúdo dentro das seções
CREATE TABLE public.content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.site_pages(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.page_sections(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL, -- 'title', 'paragraph', 'image', 'button', 'video', etc.
  content_json JSONB NOT NULL DEFAULT '{}',
  order_position INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Indexes para performance
CREATE INDEX idx_site_pages_slug ON public.site_pages(slug);
CREATE INDEX idx_site_pages_published ON public.site_pages(published);
CREATE INDEX idx_page_sections_page_id ON public.page_sections(page_id);
CREATE INDEX idx_page_sections_order ON public.page_sections(page_id, section_order);
CREATE INDEX idx_content_blocks_page_id ON public.content_blocks(page_id);
CREATE INDEX idx_content_blocks_section_id ON public.content_blocks(section_id);
CREATE INDEX idx_content_blocks_order ON public.content_blocks(page_id, order_position);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_site_pages_updated_at
  BEFORE UPDATE ON public.site_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- Políticas para site_pages
CREATE POLICY "Páginas publicadas são visíveis para todos"
  ON public.site_pages FOR SELECT
  USING (published = true);

CREATE POLICY "Admins podem gerenciar páginas"
  ON public.site_pages FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Políticas para page_sections
CREATE POLICY "Seções de páginas publicadas são visíveis"
  ON public.page_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.site_pages 
      WHERE id = page_sections.page_id AND published = true
    )
  );

CREATE POLICY "Admins podem gerenciar seções"
  ON public.page_sections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Políticas para content_blocks
CREATE POLICY "Blocos de páginas publicadas são visíveis"
  ON public.content_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.site_pages 
      WHERE id = content_blocks.page_id AND published = true
    )
  );

CREATE POLICY "Admins podem gerenciar blocos"
  ON public.content_blocks FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Inserir página home inicial como exemplo
INSERT INTO public.site_pages (slug, title, meta_description, published, hero_title, hero_subtitle)
VALUES (
  'home',
  'Igreja CBN Kerigma',
  'Igreja Cristã Batista Nacional Kerigma - Uma igreja que proclama Cristo',
  true,
  'Bem-vindos à Igreja CBN Kerigma',
  'Uma comunidade que vive e proclama o evangelho de Jesus Cristo'
);

-- Inserir alguns blocos de exemplo para a home
INSERT INTO public.content_blocks (page_id, block_type, content_json, order_position)
SELECT 
  sp.id,
  'hero_section',
  '{"title": "Bem-vindos à Igreja CBN Kerigma", "subtitle": "Uma comunidade que vive e proclama o evangelho de Jesus Cristo", "button_text": "Conheça Mais", "button_link": "#sobre"}',
  1
FROM public.site_pages sp WHERE sp.slug = 'home';

INSERT INTO public.content_blocks (page_id, block_type, content_json, order_position)
SELECT 
  sp.id,
  'text_section',
  '{"title": "Nossa Missão", "content": "Somos uma igreja comprometida em fazer discípulos de Jesus Cristo, proclamando o evangelho e vivendo em comunidade."}',
  2
FROM public.site_pages sp WHERE sp.slug = 'home';