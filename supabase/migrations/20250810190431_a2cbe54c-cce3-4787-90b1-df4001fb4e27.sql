-- ===== CORREÇÕES DE SEGURANÇA =====

-- Corrigir search_path nas funções existentes
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
SET search_path = 'public'
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
SET search_path = 'public'
AS $$
DECLARE
  volunteer_rec RECORD;
  new_convite_id UUID;
BEGIN
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

CREATE OR REPLACE FUNCTION respond_to_invitation(
  p_escala_id UUID,
  p_status confirmation_status,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    SELECT v_pessoa_id, funcao_id, CURRENT_DATE
    FROM escalas_servico WHERE id = p_escala_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Corrigir função update_updated_at_column()
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Inserir dados básicos para demonstração
INSERT INTO public.ministerios (nome, descricao) VALUES
('Louvor e Adoração', 'Ministério responsável pela música e adoração nos cultos'),
('Diaconia', 'Ministério de serviço e hospitalidade'),
('Mídia e Som', 'Ministério de áudio, vídeo e tecnologia'),
('Infantil', 'Ministério voltado para crianças')
ON CONFLICT DO NOTHING;

-- Criar algumas equipas de exemplo
INSERT INTO public.equipas_ministeriais (nome_equipa, ministerio_id, descricao) 
SELECT 
  'Banda Principal',
  m.id,
  'Equipa principal de louvor para cultos de domingo'
FROM ministerios m WHERE m.nome = 'Louvor e Adoração'
ON CONFLICT DO NOTHING;

INSERT INTO public.equipas_ministeriais (nome_equipa, ministerio_id, descricao) 
SELECT 
  'Diaconia Domingo Manhã',
  m.id,
  'Equipa de diaconia para culto matutino'
FROM ministerios m WHERE m.nome = 'Diaconia'
ON CONFLICT DO NOTHING;

-- Criar funções de exemplo
INSERT INTO public.funcoes_equipa (equipa_id, nome_funcao, descricao, nivel_experiencia)
SELECT 
  e.id,
  'Vocalista',
  'Responsável pelos vocais principais e backing vocals',
  'intermediario'
FROM equipas_ministeriais e WHERE e.nome_equipa = 'Banda Principal'
ON CONFLICT DO NOTHING;

INSERT INTO public.funcoes_equipa (equipa_id, nome_funcao, descricao, nivel_experiencia)
SELECT 
  e.id,
  'Tecladista',
  'Responsável pelo teclado e piano',
  'intermediario'
FROM equipas_ministeriais e WHERE e.nome_equipa = 'Banda Principal'
ON CONFLICT DO NOTHING;

INSERT INTO public.funcoes_equipa (equipa_id, nome_funcao, descricao, nivel_experiencia)
SELECT 
  e.id,
  'Diácono Recepção',
  'Responsável por recepcionar e acomodar os visitantes',
  'iniciante'
FROM equipas_ministeriais e WHERE e.nome_equipa = 'Diaconia Domingo Manhã'
ON CONFLICT DO NOTHING;