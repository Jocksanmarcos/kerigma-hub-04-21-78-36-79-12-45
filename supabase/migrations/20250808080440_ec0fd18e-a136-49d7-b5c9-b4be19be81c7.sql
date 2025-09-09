-- Criar as tabelas do CMS Headless
CREATE TABLE IF NOT EXISTS public.site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'events_carousel', 'courses_list', 'cells_map', 'visitor_form')),
  content_json JSONB DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para site_pages
CREATE POLICY "Admins podem gerenciar páginas" ON public.site_pages
  FOR ALL USING (is_admin());

CREATE POLICY "Páginas publicadas são públicas" ON public.site_pages
  FOR SELECT USING (published = true);

-- Políticas RLS para content_blocks
CREATE POLICY "Admins podem gerenciar blocos" ON public.content_blocks
  FOR ALL USING (is_admin());

CREATE POLICY "Blocos de páginas publicadas são públicos" ON public.content_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM site_pages sp 
      WHERE sp.id = content_blocks.page_id 
      AND sp.published = true
    )
  );

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_pages_updated_at
  BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at
  BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();