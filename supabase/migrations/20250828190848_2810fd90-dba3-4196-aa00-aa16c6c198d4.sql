-- Criação da tabela principal para o perfil da jornada dos usuários
CREATE TABLE public.jornada_perfis_usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  pontos_sabedoria INTEGER NOT NULL DEFAULT 0,
  nivel TEXT NOT NULL DEFAULT 'Aprendiz',
  next_level_xp INTEGER NOT NULL DEFAULT 100,
  capitulos_lidos_ids UUID[] NOT NULL DEFAULT '{}',
  ultima_atividade_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.jornada_perfis_usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários verem apenas seus próprios dados
CREATE POLICY "Usuários podem ver próprio perfil da jornada" 
ON public.jornada_perfis_usuarios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio perfil da jornada" 
ON public.jornada_perfis_usuarios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar próprio perfil da jornada" 
ON public.jornada_perfis_usuarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Sistema pode inserir/atualizar perfis
CREATE POLICY "Sistema pode gerenciar perfis da jornada" 
ON public.jornada_perfils_usuarios 
FOR ALL 
USING (auth.role() = 'service_role');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_jornada_perfis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jornada_perfis_updated_at
BEFORE UPDATE ON public.jornada_perfis_usuarios
FOR EACH ROW
EXECUTE FUNCTION public.update_jornada_perfis_updated_at();

-- Tabela para registrar atividades de estudo (para streak)
CREATE TABLE public.atividades_estudo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL,
  tipo_atividade TEXT NOT NULL, -- 'leitura', 'quiz', 'desafio'
  curso_id UUID,
  licao_id UUID,
  duracao_minutos INTEGER DEFAULT 0,
  data_atividade DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_atividade_dia UNIQUE(pessoa_id, data_atividade, tipo_atividade)
);

-- Habilitar RLS
ALTER TABLE public.atividades_estudo ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver próprias atividades" 
ON public.atividades_estudo 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM pessoas WHERE pessoas.id = atividades_estudo.pessoa_id AND pessoas.user_id = auth.uid()
));

CREATE POLICY "Sistema pode gerenciar atividades" 
ON public.atividades_estudo 
FOR ALL 
USING (auth.role() = 'service_role');

-- Tabela para estatísticas dos alunos (XP, nível, badges)
CREATE TABLE public.aluno_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  nivel TEXT NOT NULL DEFAULT 'Aprendiz',
  next_level_xp INTEGER NOT NULL DEFAULT 2000,
  badge_atual TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.aluno_stats ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver próprias estatísticas" 
ON public.aluno_stats 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM pessoas WHERE pessoas.id = aluno_stats.pessoa_id AND pessoas.user_id = auth.uid()
));

CREATE POLICY "Sistema pode gerenciar estatísticas" 
ON public.aluno_stats 
FOR ALL 
USING (auth.role() = 'service_role');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_aluno_stats_updated_at
BEFORE UPDATE ON public.aluno_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_trigger();