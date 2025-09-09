-- ===== ETAPA 1: ESTRUTURA DA BASE DE DADOS PARA ESCALAS =====

-- Tabela de Ministérios (base para as equipas)
CREATE TABLE IF NOT EXISTS public.ministerios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  lider_id UUID REFERENCES public.pessoas(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Equipas Ministeriais
CREATE TABLE IF NOT EXISTS public.equipas_ministeriais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_equipa TEXT NOT NULL,
  ministerio_id UUID REFERENCES public.ministerios(id),
  descricao TEXT,
  lider_id UUID REFERENCES public.pessoas(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Funções por Equipa
CREATE TABLE IF NOT EXISTS public.funcoes_equipa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipa_id UUID REFERENCES public.equipas_ministeriais(id) ON DELETE CASCADE,
  nome_funcao TEXT NOT NULL,
  descricao TEXT,
  competencias_requeridas JSONB DEFAULT '[]'::jsonb,
  nivel_experiencia TEXT DEFAULT 'iniciante' CHECK (nivel_experiencia IN ('iniciante', 'intermediario', 'avancado')),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Membros da Equipa (relação many-to-many)
CREATE TABLE IF NOT EXISTS public.membros_equipa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
  funcao_id UUID REFERENCES public.funcoes_equipa(id) ON DELETE CASCADE,
  nivel_competencia TEXT DEFAULT 'iniciante' CHECK (nivel_competencia IN ('iniciante', 'intermediario', 'avancado')),
  disponibilidade_semanal TEXT[] DEFAULT ARRAY['domingo']::text[],
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  data_ingresso DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pessoa_id, funcao_id)
);

-- Modificar a tabela escalas_servico para adicionar funcao_id
ALTER TABLE public.escalas_servico 
ADD COLUMN IF NOT EXISTS funcao_id UUID REFERENCES public.funcoes_equipa(id);

-- Tabela para armazenar disponibilidade de voluntários
CREATE TABLE IF NOT EXISTS public.disponibilidade_voluntarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  disponivel BOOLEAN DEFAULT true,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para histórico de serviços
CREATE TABLE IF NOT EXISTS public.historico_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES public.pessoas(id),
  funcao_id UUID REFERENCES public.funcoes_equipa(id),
  data_servico DATE NOT NULL,
  avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para notificações de escalas
CREATE TABLE IF NOT EXISTS public.notificacoes_escala (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_servico_id UUID REFERENCES public.escalas_servico(id) ON DELETE CASCADE,
  tipo_notificacao TEXT NOT NULL CHECK (tipo_notificacao IN ('convite', 'confirmacao', 'recusa', 'lembrete', 'alteracao')),
  enviado BOOLEAN DEFAULT false,
  data_envio TIMESTAMPTZ,
  metodo_envio TEXT DEFAULT 'app' CHECK (metodo_envio IN ('app', 'email', 'sms', 'push')),
  conteudo_mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_ministerios_updated_at BEFORE UPDATE ON public.ministerios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_equipas_ministeriais_updated_at BEFORE UPDATE ON public.equipas_ministeriais FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_funcoes_equipa_updated_at BEFORE UPDATE ON public.funcoes_equipa FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_membros_equipa_updated_at BEFORE UPDATE ON public.membros_equipa FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_disponibilidade_voluntarios_updated_at BEFORE UPDATE ON public.disponibilidade_voluntarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ===== ETAPA 2: LÓGICA DE CONVOCATÓRIA INTELIGENTE =====

-- Função para sugerir voluntários qualificados
CREATE OR REPLACE FUNCTION get_volunteer_suggestions(
  p_funcao_id UUID,
  p_data_servico DATE,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  pessoa_id UUID,
  nome TEXT,
  nivel_competencia TEXT,
  ultima_vez_serviu DATE,
  dias_desde_ultimo_servico INTEGER,
  disponivel BOOLEAN,
  pontuacao INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH volunteer_stats AS (
    SELECT 
      me.pessoa_id,
      p.nome_completo as nome,
      me.nivel_competencia,
      MAX(hs.data_servico) as ultima_vez_serviu,
      COALESCE(DATE_PART('day', p_data_servico - MAX(hs.data_servico)), 365) as dias_desde_ultimo,
      NOT EXISTS(
        SELECT 1 FROM disponibilidade_voluntarios dv 
        WHERE dv.pessoa_id = me.pessoa_id 
        AND p_data_servico BETWEEN dv.data_inicio AND dv.data_fim 
        AND dv.disponivel = false
      ) as disponivel,
      -- Pontuação baseada em: tempo desde último serviço + nível + disponibilidade
      CASE 
        WHEN NOT EXISTS(
          SELECT 1 FROM disponibilidade_voluntarios dv 
          WHERE dv.pessoa_id = me.pessoa_id 
          AND p_data_servico BETWEEN dv.data_inicio AND dv.data_fim 
          AND dv.disponivel = false
        ) THEN 
          LEAST(COALESCE(DATE_PART('day', p_data_servico - MAX(hs.data_servico)), 365)::INTEGER, 100) +
          CASE me.nivel_competencia
            WHEN 'avancado' THEN 30
            WHEN 'intermediario' THEN 20
            ELSE 10
          END
        ELSE 0
      END as pontuacao
    FROM membros_equipa me
    JOIN pessoas p ON p.id = me.pessoa_id
    LEFT JOIN historico_servicos hs ON hs.pessoa_id = me.pessoa_id AND hs.funcao_id = me.funcao_id
    WHERE me.funcao_id = p_funcao_id 
    AND me.ativo = true
    AND p.situacao = 'ativo'
    GROUP BY me.pessoa_id, p.nome_completo, me.nivel_competencia
  )
  SELECT 
    vs.pessoa_id,
    vs.nome,
    vs.nivel_competencia,
    vs.ultima_vez_serviu,
    vs.dias_desde_ultimo::INTEGER,
    vs.disponivel,
    vs.pontuacao
  FROM volunteer_stats vs
  ORDER BY vs.pontuacao DESC, vs.dias_desde_ultimo DESC
  LIMIT p_limit;
END;
$$;

-- Função para criar convites automáticos
CREATE OR REPLACE FUNCTION create_automatic_invitations(
  p_plano_id UUID,
  p_funcao_id UUID,
  p_quantidade INTEGER DEFAULT 1
)
RETURNS TABLE (
  convite_id UUID,
  pessoa_id UUID,
  nome_pessoa TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  volunteer_rec RECORD;
  new_convite_id UUID;
BEGIN
  -- Obter data do plano/culto
  FOR volunteer_rec IN
    SELECT vs.pessoa_id, vs.nome 
    FROM get_volunteer_suggestions(p_funcao_id, CURRENT_DATE, p_quantidade) vs
  LOOP
    -- Criar registro na escalas_servico
    INSERT INTO escalas_servico (
      plano_id, 
      pessoa_id, 
      funcao_id, 
      funcao, 
      status_confirmacao, 
      data_convite,
      created_by
    )
    VALUES (
      p_plano_id, 
      volunteer_rec.pessoa_id, 
      p_funcao_id,
      (SELECT nome_funcao FROM funcoes_equipa WHERE id = p_funcao_id),
      'Convidado'::confirmation_status, 
      now(),
      auth.uid()
    )
    RETURNING id INTO new_convite_id;
    
    -- Criar notificação
    INSERT INTO notificacoes_escala (
      escala_servico_id,
      tipo_notificacao,
      conteudo_mensagem,
      metodo_envio
    )
    VALUES (
      new_convite_id,
      'convite',
      'Você foi convidado(a) para servir na função: ' || (SELECT nome_funcao FROM funcoes_equipa WHERE id = p_funcao_id),
      'app'
    );
    
    -- Retornar resultado
    convite_id := new_convite_id;
    pessoa_id := volunteer_rec.pessoa_id;
    nome_pessoa := volunteer_rec.nome;
    
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Função para resposta de voluntário
CREATE OR REPLACE FUNCTION respond_to_invitation(
  p_escala_id UUID,
  p_status confirmation_status,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pessoa_id UUID;
  v_plano_id UUID;
BEGIN
  -- Verificar se o usuário atual pode responder a este convite
  SELECT pessoa_id, plano_id INTO v_pessoa_id, v_plano_id
  FROM escalas_servico 
  WHERE id = p_escala_id 
  AND pessoa_id = get_current_person_id();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Atualizar status
  UPDATE escalas_servico 
  SET 
    status_confirmacao = p_status,
    data_resposta = now(),
    observacoes = p_observacoes
  WHERE id = p_escala_id;
  
  -- Criar notificação para o líder
  INSERT INTO notificacoes_escala (
    escala_servico_id,
    tipo_notificacao,
    conteudo_mensagem,
    metodo_envio
  )
  VALUES (
    p_escala_id,
    CASE p_status 
      WHEN 'Confirmado'::confirmation_status THEN 'confirmacao'
      ELSE 'recusa'
    END,
    (SELECT p.nome_completo FROM pessoas p WHERE p.id = v_pessoa_id) || 
    CASE p_status 
      WHEN 'Confirmado'::confirmation_status THEN ' confirmou presença'
      ELSE ' recusou o convite'
    END,
    'app'
  );
  
  -- Registrar no histórico se confirmado
  IF p_status = 'Confirmado'::confirmation_status THEN
    INSERT INTO historico_servicos (pessoa_id, funcao_id, data_servico)
    SELECT v_pessoa_id, funcao_id, (SELECT data_evento FROM culto_planos cp WHERE cp.id = v_plano_id)
    FROM escalas_servico WHERE id = p_escala_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- ===== RLS POLICIES =====

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.ministerios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipas_ministeriais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcoes_equipa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_equipa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidade_voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_escala ENABLE ROW LEVEL SECURITY;

-- Políticas para ministérios
CREATE POLICY "Todos podem ver ministérios ativos" ON public.ministerios FOR SELECT USING (ativo = true);
CREATE POLICY "Líderes podem gerenciar ministérios" ON public.ministerios FOR ALL USING (is_admin() OR user_has_permission('manage', 'ministerios'));

-- Políticas para equipas ministeriais  
CREATE POLICY "Todos podem ver equipas ativas" ON public.equipas_ministeriais FOR SELECT USING (ativo = true);
CREATE POLICY "Líderes podem gerenciar equipas" ON public.equipas_ministeriais FOR ALL USING (is_admin() OR user_has_permission('manage', 'equipas') OR lider_id = get_current_person_id());

-- Políticas para funções da equipa
CREATE POLICY "Todos podem ver funções ativas" ON public.funcoes_equipa FOR SELECT USING (ativo = true);
CREATE POLICY "Líderes podem gerenciar funções" ON public.funcoes_equipa FOR ALL USING (
  is_admin() OR 
  user_has_permission('manage', 'equipas') OR 
  EXISTS(SELECT 1 FROM equipas_ministeriais em WHERE em.id = equipa_id AND em.lider_id = get_current_person_id())
);

-- Políticas para membros da equipa
CREATE POLICY "Membros podem ver própria participação" ON public.membros_equipa FOR SELECT USING (pessoa_id = get_current_person_id() OR is_admin());
CREATE POLICY "Líderes podem gerenciar membros" ON public.membros_equipa FOR ALL USING (
  is_admin() OR 
  user_has_permission('manage', 'equipas') OR
  EXISTS(
    SELECT 1 FROM equipas_ministeriais em 
    JOIN funcoes_equipa fe ON fe.equipa_id = em.id 
    WHERE fe.id = funcao_id AND em.lider_id = get_current_person_id()
  )
);

-- Políticas para disponibilidade
CREATE POLICY "Usuários podem gerenciar própria disponibilidade" ON public.disponibilidade_voluntarios FOR ALL USING (pessoa_id = get_current_person_id());
CREATE POLICY "Líderes podem ver disponibilidade da equipa" ON public.disponibilidade_voluntarios FOR SELECT USING (
  is_admin() OR 
  user_has_permission('read', 'escalas') OR
  EXISTS(
    SELECT 1 FROM membros_equipa me 
    JOIN funcoes_equipa fe ON fe.id = me.funcao_id
    JOIN equipas_ministeriais em ON em.id = fe.equipa_id
    WHERE me.pessoa_id = disponibilidade_voluntarios.pessoa_id 
    AND em.lider_id = get_current_person_id()
  )
);

-- Políticas para histórico
CREATE POLICY "Usuários podem ver próprio histórico" ON public.historico_servicos FOR SELECT USING (pessoa_id = get_current_person_id() OR is_admin());
CREATE POLICY "Sistema pode inserir histórico" ON public.historico_servicos FOR INSERT WITH CHECK (true);

-- Políticas para notificações
CREATE POLICY "Usuários podem ver próprias notificações" ON public.notificacoes_escala FOR SELECT USING (
  EXISTS(SELECT 1 FROM escalas_servico es WHERE es.id = escala_servico_id AND es.pessoa_id = get_current_person_id()) OR
  is_admin()
);
CREATE POLICY "Sistema pode gerenciar notificações" ON public.notificacoes_escala FOR ALL USING (true);