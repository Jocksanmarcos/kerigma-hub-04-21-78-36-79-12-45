-- =====================================================
-- MIGRAÇÃO: Plataforma de E-learning "Legado"
-- =====================================================

-- 1. Expandir tabela cursos com campos necessários para e-learning
ALTER TABLE public.cursos 
ADD COLUMN IF NOT EXISTS imagem_capa_url TEXT,
ADD COLUMN IF NOT EXISTS instrutor_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS pontos_xp_recompensa INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS medalha_id_recompensa UUID REFERENCES jornada_medalhas(id),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'rascunho' CHECK (status IN ('publicado', 'rascunho')),
ADD COLUMN IF NOT EXISTS pre_requisito_curso_id UUID REFERENCES cursos(id);

-- 2. Criar tabela de aulas/lições
CREATE TABLE IF NOT EXISTS public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  titulo_aula TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 1,
  tipo_conteudo TEXT NOT NULL DEFAULT 'video' CHECK (tipo_conteudo IN ('video', 'texto', 'quiz')),
  conteudo_principal TEXT, -- URL do vídeo ou conteúdo HTML/Markdown
  material_extra_url TEXT, -- Link para apostila/PDF
  duracao_minutos INTEGER DEFAULT 0,
  disponivel_apos_data DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(curso_id, ordem)
);

-- 3. Criar tabela de progresso de alunos por aula
CREATE TABLE IF NOT EXISTS public.progresso_alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL,
  aula_id UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_progresso', 'concluido')),
  data_conclusao TIMESTAMP WITH TIME ZONE,
  tempo_assistido_minutos INTEGER DEFAULT 0,
  tentativas_quiz INTEGER DEFAULT 0,
  pontuacao_quiz NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(pessoa_id, aula_id)
);

-- 4. Criar tabela de inscrições em cursos (complementar à matriculas existente)
CREATE TABLE IF NOT EXISTS public.inscricoes_cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,  
  pessoa_id UUID NOT NULL,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  data_inscricao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  origem_inscricao TEXT DEFAULT 'manual', -- 'manual', 'trilha', 'recomendacao'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(pessoa_id, curso_id)
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_aulas_curso_ordem ON aulas(curso_id, ordem);
CREATE INDEX IF NOT EXISTS idx_progresso_pessoa_aula ON progresso_alunos(pessoa_id, aula_id);
CREATE INDEX IF NOT EXISTS idx_progresso_aula_status ON progresso_alunos(aula_id, status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_pessoa ON inscricoes_cursos(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_curso ON inscricoes_cursos(curso_id);

-- 6. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_aulas_updated_at 
  BEFORE UPDATE ON aulas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progresso_alunos_updated_at 
  BEFORE UPDATE ON progresso_alunos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS Policies

-- Aulas: qualquer um pode ver aulas de cursos publicados
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer um pode ver aulas de cursos publicados" ON aulas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cursos 
      WHERE cursos.id = aulas.curso_id 
      AND cursos.status = 'publicado'
    )
  );

CREATE POLICY "Admins podem gerenciar aulas" ON aulas
  FOR ALL USING (is_admin());

-- Progresso: usuários podem ver/atualizar seu próprio progresso
ALTER TABLE public.progresso_alunos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver próprio progresso" ON progresso_alunos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pessoas 
      WHERE pessoas.id = progresso_alunos.pessoa_id 
      AND pessoas.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar próprio progresso" ON progresso_alunos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pessoas 
      WHERE pessoas.id = progresso_alunos.pessoa_id 
      AND pessoas.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem modificar próprio progresso" ON progresso_alunos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pessoas 
      WHERE pessoas.id = progresso_alunos.pessoa_id 
      AND pessoas.user_id = auth.uid()
    )
  );

-- Inscrições: usuários podem se inscrever e ver próprias inscrições
ALTER TABLE public.inscricoes_cursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver próprias inscrições" ON inscricoes_cursos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pessoas 
      WHERE pessoas.id = inscricoes_cursos.pessoa_id 
      AND pessoas.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem se inscrever em cursos" ON inscricoes_cursos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pessoas 
      WHERE pessoas.id = inscricoes_cursos.pessoa_id 
      AND pessoas.user_id = auth.uid()
    )
  );

-- 8. Atualizar cursos existentes para status 'publicado'
UPDATE public.cursos SET status = 'publicado' WHERE status IS NULL OR status = '';

-- 9. Função para calcular progresso do curso
CREATE OR REPLACE FUNCTION calcular_progresso_curso(p_pessoa_id UUID, p_curso_id UUID)
RETURNS TABLE(
  total_aulas INTEGER,
  aulas_concluidas INTEGER,
  percentual_progresso NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(a.id)::INTEGER as total_aulas,
    COUNT(CASE WHEN pa.status = 'concluido' THEN 1 END)::INTEGER as aulas_concluidas,
    CASE 
      WHEN COUNT(a.id) = 0 THEN 0
      ELSE ROUND((COUNT(CASE WHEN pa.status = 'concluido' THEN 1 END)::NUMERIC / COUNT(a.id)::NUMERIC) * 100, 2)
    END as percentual_progresso
  FROM aulas a
  LEFT JOIN progresso_alunos pa ON (a.id = pa.aula_id AND pa.pessoa_id = p_pessoa_id)
  WHERE a.curso_id = p_curso_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;