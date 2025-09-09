-- Aprimorar estrutura de células para suportar hierarquia e IA
ALTER TABLE public.celulas 
ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.pessoas(id),
ADD COLUMN IF NOT EXISTS coordenador_id UUID REFERENCES public.pessoas(id),
ADD COLUMN IF NOT EXISTS saude_celula TEXT DEFAULT 'Verde' CHECK (saude_celula IN ('Verde', 'Amarelo', 'Vermelho'));

-- Garantir que a tabela participantes_celulas existe com estrutura completa
CREATE TABLE IF NOT EXISTS public.participantes_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  funcao TEXT NOT NULL DEFAULT 'Membro' CHECK (funcao IN ('Líder', 'Co-líder', 'Líder em Treinamento', 'Anfitrião', 'Membro')),
  data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
  data_saida DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(celula_id, pessoa_id, funcao)
);

-- Biblioteca de recursos para células
CREATE TABLE IF NOT EXISTS public.biblioteca_recursos_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('Estudo Semanal', 'Quebra-Gelo', 'Vídeo de Treino', 'Material de Apoio', 'Dinâmica', 'Devocional')),
  arquivo_url TEXT,
  arquivo_nome TEXT,
  arquivo_tamanho TEXT,
  categoria TEXT DEFAULT 'Geral',
  publico_alvo TEXT[] DEFAULT ARRAY['Líder', 'Co-líder'],
  tags TEXT[],
  downloads INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  criado_por UUID REFERENCES public.pessoas(id),
  aprovado_por UUID REFERENCES public.pessoas(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para visitantes e acompanhamento
CREATE TABLE IF NOT EXISTS public.visitantes_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  idade INTEGER,
  endereco TEXT,
  como_conheceu TEXT,
  data_visita DATE NOT NULL DEFAULT CURRENT_DATE,
  retornou BOOLEAN DEFAULT false,
  data_retorno DATE,
  status_acompanhamento TEXT DEFAULT 'Pendente' CHECK (status_acompanhamento IN ('Pendente', 'Contatado', 'Agendado', 'Convertido', 'Sem interesse')),
  observacoes TEXT,
  responsavel_acompanhamento UUID REFERENCES public.pessoas(id),
  data_proximo_contato DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Relatórios semanais de células
CREATE TABLE IF NOT EXISTS public.relatorios_semanais_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id),
  data_reuniao DATE NOT NULL,
  presentes INTEGER NOT NULL DEFAULT 0,
  visitantes INTEGER DEFAULT 0,
  decisoes INTEGER DEFAULT 0,
  ofertas DECIMAL(10,2) DEFAULT 0,
  tema_estudo TEXT,
  observacoes TEXT,
  desafios TEXT,
  motivos_oracao TEXT[],
  testemunhos TEXT,
  visitantes_nomes TEXT[],
  relator_id UUID REFERENCES public.pessoas(id),
  aprovado_por UUID REFERENCES public.pessoas(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.participantes_celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_recursos_celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitantes_celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_semanais_celulas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Líderes podem gerenciar participantes de suas células" 
ON public.participantes_celulas FOR ALL USING (
  is_admin() OR user_has_permission('manage', 'celulas') OR
  EXISTS (
    SELECT 1 FROM public.celulas c 
    WHERE c.id = participantes_celulas.celula_id 
    AND (c.lider_id = get_current_person_id() OR c.supervisor_id = get_current_person_id())
  )
);

CREATE POLICY "Administradores podem gerenciar recursos" 
ON public.biblioteca_recursos_celulas FOR ALL USING (
  is_admin() OR user_has_permission('manage', 'recursos_celulas')
);

CREATE POLICY "Líderes podem ver recursos aprovados" 
ON public.biblioteca_recursos_celulas FOR SELECT USING (
  ativo = true AND aprovado_em IS NOT NULL
);

CREATE POLICY "Líderes podem gerenciar visitantes de suas células" 
ON public.visitantes_celulas FOR ALL USING (
  is_admin() OR user_has_permission('manage', 'celulas') OR
  EXISTS (
    SELECT 1 FROM public.celulas c 
    WHERE c.id = visitantes_celulas.celula_id 
    AND (c.lider_id = get_current_person_id() OR c.supervisor_id = get_current_person_id())
  )
);

CREATE POLICY "Líderes podem gerenciar relatórios de suas células" 
ON public.relatorios_semanais_celulas FOR ALL USING (
  is_admin() OR user_has_permission('manage', 'celulas') OR
  EXISTS (
    SELECT 1 FROM public.celulas c 
    WHERE c.id = relatorios_semanais_celulas.celula_id 
    AND (c.lider_id = get_current_person_id() OR c.supervisor_id = get_current_person_id())
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_participantes_celulas_updated_at BEFORE UPDATE ON public.participantes_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_biblioteca_recursos_updated_at BEFORE UPDATE ON public.biblioteca_recursos_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visitantes_celulas_updated_at BEFORE UPDATE ON public.visitantes_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relatorios_semanais_updated_at BEFORE UPDATE ON public.relatorios_semanais_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular saúde da célula automaticamente
CREATE OR REPLACE FUNCTION public.calcular_saude_celula(celula_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_relatorios INTEGER;
  relatorios_recentes INTEGER;
  media_presenca DECIMAL;
  crescimento_visitantes DECIMAL;
  saude TEXT;
BEGIN
  -- Contar relatórios dos últimos 30 dias
  SELECT COUNT(*) INTO relatorios_recentes
  FROM public.relatorios_semanais_celulas
  WHERE celula_id = celula_uuid AND data_reuniao > CURRENT_DATE - INTERVAL '30 days';
  
  -- Calcular média de presença dos últimos 8 relatórios
  SELECT AVG(presentes) INTO media_presenca
  FROM (
    SELECT presentes FROM public.relatorios_semanais_celulas
    WHERE celula_id = celula_uuid
    ORDER BY data_reuniao DESC
    LIMIT 8
  ) recent_reports;
  
  -- Calcular crescimento de visitantes
  SELECT AVG(visitantes) INTO crescimento_visitantes
  FROM public.relatorios_semanais_celulas
  WHERE celula_id = celula_uuid AND data_reuniao > CURRENT_DATE - INTERVAL '60 days';
  
  -- Definir saúde baseada em critérios
  IF relatorios_recentes >= 3 AND COALESCE(media_presenca, 0) >= 8 AND COALESCE(crescimento_visitantes, 0) >= 1 THEN
    saude := 'Verde';
  ELSIF relatorios_recentes >= 2 AND COALESCE(media_presenca, 0) >= 5 THEN
    saude := 'Amarelo';
  ELSE
    saude := 'Vermelho';
  END IF;
  
  -- Atualizar a célula
  UPDATE public.celulas SET saude_celula = saude WHERE id = celula_uuid;
  
  RETURN saude;
END;
$$;

-- Trigger para atualizar saúde automaticamente quando relatório é inserido
CREATE OR REPLACE FUNCTION trigger_atualizar_saude_celula()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.calcular_saude_celula(NEW.celula_id);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER atualizar_saude_celula_trigger 
AFTER INSERT OR UPDATE ON public.relatorios_semanais_celulas 
FOR EACH ROW EXECUTE FUNCTION trigger_atualizar_saude_celula();