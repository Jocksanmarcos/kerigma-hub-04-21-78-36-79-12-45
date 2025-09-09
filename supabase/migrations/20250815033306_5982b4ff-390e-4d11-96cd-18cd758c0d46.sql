-- Phase 1: Create and Configure Public APIs Data Bridge (FINAL)
-- Fix existing tables and create proper structure

-- Drop existing tables if they exist (to recreate with correct structure)
DROP TABLE IF EXISTS public.content_blocks CASCADE;
DROP TABLE IF EXISTS public.site_pages CASCADE;

-- Create site_pages table with correct structure
CREATE TABLE public.site_pages (
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
CREATE TABLE public.content_blocks (
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

-- Insert default home page
INSERT INTO public.site_pages (title, slug, hero_title, hero_subtitle, published)
VALUES (
  'Início', 
  'home', 
  'Encontre o seu Lugar',
  'Uma igreja onde cada pessoa é valorizada e encontra sua família em Cristo',
  true
);