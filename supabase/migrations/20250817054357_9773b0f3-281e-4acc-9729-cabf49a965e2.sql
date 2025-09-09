-- Criar função para obter ID da pessoa atual
CREATE OR REPLACE FUNCTION public.get_current_person_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.pessoas 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$;

-- Adicionar política para usuários verem seu próprio perfil
CREATE POLICY "users_can_view_own_profile" ON public.pessoas
FOR SELECT
USING (user_id = auth.uid());

-- Criar tabela para dados do portal do aluno se não existir
CREATE TABLE IF NOT EXISTS public.aluno_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  nivel text DEFAULT 'Aprendiz',
  xp integer DEFAULT 0,
  next_level_xp integer DEFAULT 2000,
  badge_atual text DEFAULT 'Estudante Dedicado',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(pessoa_id)
);

-- Política para stats do aluno
CREATE POLICY "users_can_view_own_stats" ON public.aluno_stats
FOR SELECT
USING (pessoa_id = get_current_person_id());

CREATE POLICY "users_can_create_own_stats" ON public.aluno_stats
FOR INSERT
WITH CHECK (pessoa_id = get_current_person_id());

CREATE POLICY "users_can_update_own_stats" ON public.aluno_stats
FOR UPDATE
USING (pessoa_id = get_current_person_id());

-- Habilitar RLS na tabela aluno_stats
ALTER TABLE public.aluno_stats ENABLE ROW LEVEL SECURITY;