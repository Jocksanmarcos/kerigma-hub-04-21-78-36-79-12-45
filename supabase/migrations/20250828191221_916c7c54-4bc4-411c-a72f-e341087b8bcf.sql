-- Adicionar colunas faltantes na tabela jornada_perfis_usuarios
ALTER TABLE public.jornada_perfis_usuarios 
ADD COLUMN IF NOT EXISTS nivel TEXT NOT NULL DEFAULT 'Aprendiz',
ADD COLUMN IF NOT EXISTS next_level_xp INTEGER NOT NULL DEFAULT 100;