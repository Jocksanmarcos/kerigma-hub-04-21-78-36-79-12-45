-- Ajustar a tabela pessoas para suportar o ciclo de vida do visitante
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS status_acompanhamento TEXT DEFAULT 'novo';

-- Comentário na coluna
COMMENT ON COLUMN public.pessoas.status_acompanhamento IS 'Status do processo de acompanhamento do visitante (novo, contatado, em_acompanhamento, integrado, inativo)';

-- Criar tabela para notas de acompanhamento de visitantes
CREATE TABLE IF NOT EXISTS public.notas_acompanhamento_visitantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  usuario_responsavel UUID REFERENCES auth.users(id),
  data_contato DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_contato TEXT NOT NULL DEFAULT 'ligacao', -- ligacao, whatsapp, visita, email
  resultado TEXT NOT NULL DEFAULT 'sem_resposta', -- contatado, sem_resposta, reagendado, integrado
  observacoes TEXT,
  proximo_contato DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS para notas de acompanhamento
ALTER TABLE public.notas_acompanhamento_visitantes ENABLE ROW LEVEL SECURITY;

-- Policies para notas de acompanhamento
CREATE POLICY "Membros podem gerenciar notas de acompanhamento"
ON public.notas_acompanhamento_visitantes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.pessoas p 
    WHERE p.user_id = auth.uid() 
    AND p.situacao = 'ativo'
  ) OR is_admin()
);

-- Criar tabela para formulários de recepção
CREATE TABLE IF NOT EXISTS public.formularios_recepcao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  idade INTEGER,
  endereco TEXT,
  como_conheceu TEXT,
  primeira_visita BOOLEAN DEFAULT true,
  interessado_em TEXT[], -- array de interesses: celula, cursos, ministerio, etc
  observacoes TEXT,
  recepcionista_nome TEXT,
  data_visita DATE DEFAULT CURRENT_DATE,
  status_processamento TEXT DEFAULT 'pendente', -- pendente, processado, integrado
  pessoa_id UUID REFERENCES public.pessoas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS para formulários de recepção
ALTER TABLE public.formularios_recepcao ENABLE ROW LEVEL SECURITY;

-- Policies para formulários de recepção
CREATE POLICY "Recepcionistas podem criar formulários"
ON public.formularios_recepcao
FOR INSERT
WITH CHECK (true); -- Qualquer um pode inserir (para tablets da recepção)

CREATE POLICY "Admins e líderes podem gerenciar formulários"
ON public.formularios_recepcao
FOR ALL
USING (is_admin() OR user_has_permission('read', 'pessoas'));

-- Função para converter visitante em membro
CREATE OR REPLACE FUNCTION public.converter_visitante_em_membro(p_pessoa_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resultado jsonb;
BEGIN
  -- Verificar se é admin ou tem permissões
  IF NOT (is_admin() OR user_has_permission('update', 'pessoas')) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permissão negada');
  END IF;

  -- Verificar se a pessoa existe e é visitante
  IF NOT EXISTS (
    SELECT 1 FROM pessoas 
    WHERE id = p_pessoa_id 
    AND situacao = 'visitante'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pessoa não encontrada ou não é visitante');
  END IF;

  -- Converter para membro
  UPDATE pessoas 
  SET 
    situacao = 'ativo',
    tipo_pessoa = 'membro',
    data_membresia = CURRENT_DATE,
    status_acompanhamento = 'integrado',
    updated_at = now()
  WHERE id = p_pessoa_id;

  -- Registrar no histórico
  INSERT INTO historico_pessoas (
    pessoa_id,
    tipo_evento,
    descricao,
    valor_anterior,
    valor_novo,
    usuario_responsavel
  ) VALUES (
    p_pessoa_id,
    'conversao_membro',
    'Visitante convertido em membro',
    'visitante',
    'membro',
    auth.uid()
  );

  RETURN jsonb_build_object('success', true, 'message', 'Visitante convertido em membro com sucesso');
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_visitantes()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notas_acompanhamento_updated_at
  BEFORE UPDATE ON notas_acompanhamento_visitantes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_visitantes();

CREATE TRIGGER update_formularios_recepcao_updated_at
  BEFORE UPDATE ON formularios_recepcao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_visitantes();