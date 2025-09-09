-- Tabela para rastrear atividades de estudo diárias
CREATE TABLE IF NOT EXISTS public.atividades_estudo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL,
  data_atividade DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_atividade TEXT NOT NULL, -- 'aula_completa', 'licao_completa', 'exercicio_feito', 'video_assistido'
  curso_id UUID,
  licao_id UUID,
  duracao_minutos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_atividades_estudo_pessoa_data ON public.atividades_estudo(pessoa_id, data_atividade);
CREATE INDEX IF NOT EXISTS idx_atividades_estudo_curso ON public.atividades_estudo(curso_id);

-- Função para calcular sequência de estudos
CREATE OR REPLACE FUNCTION public.calcular_sequencia_estudos(p_pessoa_id UUID)
RETURNS TABLE(
  sequencia_atual INTEGER,
  melhor_sequencia INTEGER,
  dias_este_mes INTEGER,
  atividades_esta_semana INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sequencia_atual INTEGER := 0;
  v_melhor_sequencia INTEGER := 0;
  v_sequencia_temp INTEGER := 0;
  v_data_anterior DATE;
  v_data_atual DATE;
  activity_record RECORD;
BEGIN
  -- Buscar atividades ordenadas por data (mais recente primeiro)
  FOR activity_record IN 
    SELECT DISTINCT data_atividade 
    FROM atividades_estudo 
    WHERE pessoa_id = p_pessoa_id 
    ORDER BY data_atividade DESC
  LOOP
    IF v_data_anterior IS NULL THEN
      -- Primeira iteração
      v_sequencia_atual := 1;
      v_sequencia_temp := 1;
      v_data_anterior := activity_record.data_atividade;
    ELSE
      -- Verificar se é consecutivo
      IF v_data_anterior - activity_record.data_atividade = 1 THEN
        v_sequencia_atual := v_sequencia_atual + 1;
        v_sequencia_temp := v_sequencia_temp + 1;
      ELSE
        -- Quebrou a sequência, finalizar sequência atual
        IF v_sequencia_temp > v_melhor_sequencia THEN
          v_melhor_sequencia := v_sequencia_temp;
        END IF;
        v_sequencia_atual := 0; -- Reset da sequência atual
        v_sequencia_temp := 1;
      END IF;
      v_data_anterior := activity_record.data_atividade;
    END IF;
  END LOOP;

  -- Verificar se a sequência atual é a melhor
  IF v_sequencia_temp > v_melhor_sequencia THEN
    v_melhor_sequencia := v_sequencia_temp;
  END IF;

  -- Se não estudou hoje, zerar sequência atual
  IF NOT EXISTS (
    SELECT 1 FROM atividades_estudo 
    WHERE pessoa_id = p_pessoa_id 
    AND data_atividade = CURRENT_DATE
  ) THEN
    v_sequencia_atual := 0;
  END IF;

  RETURN QUERY
  SELECT 
    v_sequencia_atual,
    v_melhor_sequencia,
    (SELECT COUNT(DISTINCT data_atividade)::INTEGER 
     FROM atividades_estudo 
     WHERE pessoa_id = p_pessoa_id 
     AND EXTRACT(MONTH FROM data_atividade) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM data_atividade) = EXTRACT(YEAR FROM CURRENT_DATE)),
    (SELECT COUNT(DISTINCT data_atividade)::INTEGER 
     FROM atividades_estudo 
     WHERE pessoa_id = p_pessoa_id 
     AND data_atividade >= CURRENT_DATE - INTERVAL '6 days'
     AND data_atividade <= CURRENT_DATE);
END;
$$;

-- Tabela para certificados automáticos
CREATE TABLE IF NOT EXISTS public.certificados_automaticos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL,
  curso_id UUID NOT NULL,
  certificado_url TEXT,
  hash_verificacao TEXT UNIQUE,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  template_usado TEXT DEFAULT 'padrao',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, curso_id)
);

-- Função para gerar certificado automaticamente
CREATE OR REPLACE FUNCTION public.gerar_certificado_automatico()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pessoa_nome TEXT;
  v_curso_nome TEXT;
  v_hash TEXT;
BEGIN
  -- Verificar se o curso foi realmente concluído (100%)
  IF NEW.progresso_percent = 100 AND (OLD.progresso_percent < 100 OR OLD.progresso_percent IS NULL) THEN
    
    -- Buscar dados da pessoa e curso
    SELECT p.nome_completo, c.nome INTO v_pessoa_nome, v_curso_nome
    FROM pessoas p, cursos c
    WHERE p.id = (SELECT pessoa_id FROM matriculas WHERE id = NEW.matricula_id)
    AND c.id = (SELECT curso_id FROM matriculas WHERE id = NEW.matricula_id);
    
    -- Gerar hash único
    v_hash := encode(digest(v_pessoa_nome || v_curso_nome || now()::text, 'sha256'), 'hex');
    
    -- Inserir certificado
    INSERT INTO certificados_automaticos (
      pessoa_id, 
      curso_id, 
      hash_verificacao,
      metadata
    ) 
    SELECT 
      m.pessoa_id,
      m.curso_id,
      v_hash,
      jsonb_build_object(
        'pessoa_nome', v_pessoa_nome,
        'curso_nome', v_curso_nome,
        'data_conclusao', NEW.updated_at
      )
    FROM matriculas m 
    WHERE m.id = NEW.matricula_id
    ON CONFLICT (pessoa_id, curso_id) DO NOTHING;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para gerar certificados
DROP TRIGGER IF EXISTS trigger_gerar_certificado ON progresso_licoes;
CREATE TRIGGER trigger_gerar_certificado
  AFTER UPDATE ON progresso_licoes
  FOR EACH ROW
  EXECUTE FUNCTION gerar_certificado_automatico();

-- RLS para atividades de estudo
ALTER TABLE public.atividades_estudo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar próprias atividades"
  ON public.atividades_estudo
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM pessoas 
    WHERE pessoas.id = atividades_estudo.pessoa_id 
    AND pessoas.user_id = auth.uid()
  ));

-- RLS para certificados automáticos
ALTER TABLE public.certificados_automaticos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprios certificados"
  ON public.certificados_automaticos
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM pessoas 
    WHERE pessoas.id = certificados_automaticos.pessoa_id 
    AND pessoas.user_id = auth.uid()
  ));

CREATE POLICY "Qualquer um pode verificar certificados"
  ON public.certificados_automaticos
  FOR SELECT
  USING (hash_verificacao IS NOT NULL);