-- Phase 1: Create and Configure Public APIs Data Bridge
-- Enable public access to specific tables for the website

-- First ensure site_pages table exists for CMS
CREATE TABLE IF NOT EXISTS public.site_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  meta_description TEXT,
  meta_keywords TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_pages
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for public reading of published pages
CREATE POLICY "Anyone can read published pages" 
ON public.site_pages 
FOR SELECT 
USING (published = true);

-- Create policies for admins to manage pages
CREATE POLICY "Admins can manage pages" 
ON public.site_pages 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create content_blocks table for dynamic content
CREATE TABLE IF NOT EXISTS public.content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.site_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}',
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on content_blocks
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for public reading of content blocks for published pages
CREATE POLICY "Anyone can read content blocks for published pages" 
ON public.content_blocks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.site_pages 
    WHERE id = content_blocks.page_id 
    AND published = true
  )
);

-- Create policies for admins to manage content blocks
CREATE POLICY "Admins can manage content blocks" 
ON public.content_blocks 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create public access policies for existing tables needed by the website

-- Public access to published events
CREATE POLICY "Anyone can read published events" 
ON public.eventos 
FOR SELECT 
USING (publico = true AND ativo = true);

-- Public access to active courses
CREATE POLICY "Anyone can read active courses" 
ON public.cursos 
FOR SELECT 
USING (ativo = true);

-- Public access to active cells (location info only)
CREATE POLICY "Anyone can read public cell information" 
ON public.celulas 
FOR SELECT 
USING (ativa = true AND publico = true);

-- Public access to gallery photos
CREATE POLICY "Anyone can read gallery photos" 
ON public.galeria_fotos 
FOR SELECT 
USING (true);

-- Public access to church information
CREATE POLICY "Anyone can read church information" 
ON public.igrejas 
FOR SELECT 
USING (ativa = true);

-- Insert default home page if it doesn't exist
INSERT INTO public.site_pages (title, slug, hero_title, hero_subtitle, published)
VALUES (
  'Início', 
  'home', 
  'Encontre o seu Lugar',
  'Uma igreja onde cada pessoa é valorizada e encontra sua família em Cristo',
  true
) ON CONFLICT (slug) DO NOTHING;