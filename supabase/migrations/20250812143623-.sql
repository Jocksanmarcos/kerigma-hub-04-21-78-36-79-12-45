-- =========================================
-- COMPREHENSIVE ENSINO MODULE ACTIVATION
-- =========================================

-- Create missing tables for complete education system
CREATE TABLE IF NOT EXISTS public.licoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  conteudo_texto TEXT,
  video_url TEXT,
  duração_estimada INTEGER DEFAULT 30, -- em minutos
  ordem INTEGER NOT NULL DEFAULT 1,
  tipo_licao TEXT DEFAULT 'video', -- video, texto, quiz, atividade
  requisitos_conclusao JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key if modulos_curso exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modulos_curso') THEN
    ALTER TABLE public.licoes 
    ADD CONSTRAINT fk_licoes_modulo 
    FOREIGN KEY (modulo_id) REFERENCES public.modulos_curso(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create quizzes table for assessments
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  licao_id UUID,
  titulo TEXT NOT NULL,
  descricao TEXT,
  perguntas JSONB NOT NULL DEFAULT '[]', -- Array of questions with options
  tempo_limite INTEGER, -- em minutos
  tentativas_permitidas INTEGER DEFAULT 3,
  nota_minima_aprovacao DECIMAL DEFAULT 7.0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key if licoes exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'licoes') THEN
    ALTER TABLE public.quizzes 
    ADD CONSTRAINT fk_quizzes_licao 
    FOREIGN KEY (licao_id) REFERENCES public.licoes(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create quiz submissions table
CREATE TABLE IF NOT EXISTS public.quiz_submissoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL,
  pessoa_id UUID NOT NULL,
  respostas JSONB NOT NULL DEFAULT '{}',
  nota_obtida DECIMAL NOT NULL DEFAULT 0,
  tempo_gasto INTEGER, -- em segundos
  concluida_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tentativa_numero INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create gamification tables
CREATE TABLE IF NOT EXISTS public.badges_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone_url TEXT,
  criterio JSONB NOT NULL, -- Criteria for earning the badge
  pontos_bonus INTEGER DEFAULT 0,
  cor TEXT DEFAULT '#3b82f6',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conquistas_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL,
  badge_id UUID,
  curso_id UUID,
  pontos_ganhos INTEGER DEFAULT 0,
  tipo_conquista TEXT DEFAULT 'licao_completa', -- licao_completa, curso_completo, quiz_aprovado, streak
  detalhes JSONB DEFAULT '{}',
  conquistada_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content creation helper tables for "Studio do Criador"
CREATE TABLE IF NOT EXISTS public.templates_licao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  estrutura_conteudo JSONB NOT NULL,
  categoria TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student progress tracking
CREATE TABLE IF NOT EXISTS public.sessoes_estudo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL,
  licao_id UUID NOT NULL,
  tempo_assistido INTEGER DEFAULT 0, -- em segundos
  marcadores JSONB DEFAULT '[]', -- Array of bookmarks/notes
  data_ultima_interacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.licoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_licao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes_estudo ENABLE ROW LEVEL SECURITY;

-- RLS Policies for licoes
CREATE POLICY "Administradores podem gerenciar lições" 
ON public.licoes FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'ensino'));

CREATE POLICY "Usuários podem visualizar lições ativas" 
ON public.licoes FOR SELECT 
USING (ativo = true);

-- RLS Policies for quizzes
CREATE POLICY "Administradores podem gerenciar quizzes" 
ON public.quizzes FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'ensino'));

CREATE POLICY "Usuários podem visualizar quizzes ativos" 
ON public.quizzes FOR SELECT 
USING (ativo = true);

-- RLS Policies for quiz submissions
CREATE POLICY "Usuários podem gerenciar próprias submissões" 
ON public.quiz_submissoes FOR ALL 
USING (pessoa_id = get_current_person_id());

CREATE POLICY "Administradores podem ver todas as submissões" 
ON public.quiz_submissoes FOR SELECT 
USING (is_admin() OR user_has_permission('read', 'ensino'));

-- RLS Policies for badges
CREATE POLICY "Badges são visíveis a todos" 
ON public.badges_ensino FOR SELECT 
USING (ativo = true);

CREATE POLICY "Administradores podem gerenciar badges" 
ON public.badges_ensino FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'ensino'));

-- RLS Policies for conquistas
CREATE POLICY "Usuários podem ver próprias conquistas" 
ON public.conquistas_ensino FOR SELECT 
USING (pessoa_id = get_current_person_id());

CREATE POLICY "Sistema pode criar conquistas" 
ON public.conquistas_ensino FOR INSERT 
WITH CHECK (true); -- Will be handled by functions

-- RLS Policies for templates
CREATE POLICY "Administradores podem gerenciar templates" 
ON public.templates_licao FOR ALL 
USING (is_admin() OR user_has_permission('manage', 'ensino'));

-- RLS Policies for sessoes_estudo
CREATE POLICY "Usuários podem gerenciar próprias sessões" 
ON public.sessoes_estudo FOR ALL 
USING (pessoa_id = get_current_person_id());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_ensino_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_licoes_updated_at
  BEFORE UPDATE ON public.licoes
  FOR EACH ROW EXECUTE FUNCTION update_ensino_updated_at();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION update_ensino_updated_at();

CREATE TRIGGER update_sessoes_estudo_updated_at
  BEFORE UPDATE ON public.sessoes_estudo
  FOR EACH ROW EXECUTE FUNCTION update_ensino_updated_at();

-- Create function to handle gamification when lessons are completed
CREATE OR REPLACE FUNCTION public.processar_conclusao_licao()
RETURNS TRIGGER AS $$
DECLARE
  pontos_base INTEGER := 10;
  badge_record RECORD;
BEGIN
  -- Award points for lesson completion
  INSERT INTO public.conquistas_ensino (
    pessoa_id, 
    pontos_ganhos, 
    tipo_conquista,
    detalhes
  ) VALUES (
    (SELECT pessoa_id FROM public.matriculas WHERE id = NEW.matricula_id),
    pontos_base,
    'licao_completa',
    jsonb_build_object('licao_id', NEW.licao_id, 'progresso_percent', NEW.progresso_percent)
  );

  -- Check for streak badges, course completion, etc.
  -- This can be expanded with more complex logic

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for gamification
CREATE TRIGGER trigger_gamification_licao_completa
  AFTER INSERT ON public.progresso_licoes
  FOR EACH ROW 
  WHEN (NEW.status = 'concluido')
  EXECUTE FUNCTION processar_conclusao_licao();

-- Insert some default badges
INSERT INTO public.badges_ensino (nome, descricao, criterio, pontos_bonus, cor) VALUES
('Primeiro Passo', 'Complete sua primeira lição', '{"tipo": "primeira_licao"}', 5, '#10b981'),
('Dedicado', 'Complete 10 lições', '{"tipo": "licoes_completas", "quantidade": 10}', 20, '#3b82f6'),
('Estudioso', 'Complete um curso inteiro', '{"tipo": "curso_completo"}', 50, '#8b5cf6'),
('Questionador', 'Faça sua primeira pergunta ao assistente IA', '{"tipo": "primeira_pergunta_ia"}', 10, '#f59e0b'),
('Mestre Quiz', 'Obtenha nota máxima em 5 quizzes', '{"tipo": "quiz_perfeito", "quantidade": 5}', 30, '#ef4444')
ON CONFLICT DO NOTHING;

-- Insert some default lesson templates for the content creator
INSERT INTO public.templates_licao (nome, descricao, estrutura_conteudo, categoria) VALUES
('Lição Padrão', 'Template básico com vídeo e texto', 
'{"secoes": [{"tipo": "video", "titulo": "Vídeo Principal"}, {"tipo": "texto", "titulo": "Conteúdo Escrito"}, {"tipo": "quiz", "titulo": "Verificação de Aprendizado"}]}', 
'basico'),
('Lição Interativa', 'Template com múltiplas atividades', 
'{"secoes": [{"tipo": "introducao", "titulo": "Introdução"}, {"tipo": "video", "titulo": "Vídeo"}, {"tipo": "atividade", "titulo": "Atividade Prática"}, {"tipo": "reflexao", "titulo": "Reflexão"}, {"tipo": "quiz", "titulo": "Avaliação"}]}', 
'interativo'),
('Estudo Bíblico', 'Template para estudos bíblicos', 
'{"secoes": [{"tipo": "texto_biblico", "titulo": "Texto Bíblico"}, {"tipo": "contexto", "titulo": "Contexto Histórico"}, {"tipo": "explicacao", "titulo": "Explicação"}, {"tipo": "aplicacao", "titulo": "Aplicação Prática"}, {"tipo": "oracao", "titulo": "Oração"}]}', 
'biblico')
ON CONFLICT DO NOTHING;