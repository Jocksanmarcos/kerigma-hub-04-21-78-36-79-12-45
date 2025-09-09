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

-- Enable RLS
ALTER TABLE public.biblioteca_recursos_celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitantes_celulas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
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

-- Create triggers for new tables
CREATE TRIGGER biblioteca_recursos_celulas_updated_at BEFORE UPDATE ON public.biblioteca_recursos_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER visitantes_celulas_updated_at BEFORE UPDATE ON public.visitantes_celulas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();