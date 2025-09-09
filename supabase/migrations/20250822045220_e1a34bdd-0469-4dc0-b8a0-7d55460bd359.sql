-- Criar edge function para análise genealógica com IA
CREATE OR REPLACE FUNCTION public.analisar_genealogia_com_ia(
  p_pessoa_id UUID DEFAULT NULL,
  p_tipo_analise TEXT DEFAULT 'sugestoes_vinculos'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  resultado JSONB := '{}';
  pessoa_dados RECORD;
  possíveis_pais JSONB := '[]';
  possíveis_filhos JSONB := '[]';
  inconsistencias JSONB := '[]';
  sugestoes JSONB := '[]';
BEGIN
  -- Buscar dados da pessoa se fornecido ID
  IF p_pessoa_id IS NOT NULL THEN
    SELECT p.*, i.nome as igreja_nome
    INTO pessoa_dados
    FROM pessoas p
    LEFT JOIN igrejas i ON i.id = p.church_id
    WHERE p.id = p_pessoa_id;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object('error', 'Pessoa não encontrada');
    END IF;
  END IF;

  -- Análise de sugestões de vínculos
  IF p_tipo_analise = 'sugestoes_vinculos' AND p_pessoa_id IS NOT NULL THEN
    
    -- Buscar possíveis pais (pessoas mais velhas com nomes similares)
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'nome', p.nome_completo,
        'idade', EXTRACT(YEAR FROM AGE(p.data_nascimento)),
        'similaridade', similarity(
          split_part(pessoa_dados.nome_completo, ' ', array_length(string_to_array(pessoa_dados.nome_completo, ' '), 1)),
          split_part(p.nome_completo, ' ', array_length(string_to_array(p.nome_completo, ' '), 1))
        ),
        'motivo', 'Sobrenome similar e idade compatível'
      )
    )
    INTO possíveis_pais
    FROM pessoas p
    WHERE p.id != pessoa_dados.id
      AND p.situacao = 'ativo'
      AND p.church_id = pessoa_dados.church_id
      AND p.data_nascimento IS NOT NULL
      AND pessoa_dados.data_nascimento IS NOT NULL
      AND EXTRACT(YEAR FROM AGE(p.data_nascimento)) - EXTRACT(YEAR FROM AGE(pessoa_dados.data_nascimento)) >= 15
      AND EXTRACT(YEAR FROM AGE(p.data_nascimento)) - EXTRACT(YEAR FROM AGE(pessoa_dados.data_nascimento)) <= 50
      AND (
        similarity(
          split_part(pessoa_dados.nome_completo, ' ', array_length(string_to_array(pessoa_dados.nome_completo, ' '), 1)),
          split_part(p.nome_completo, ' ', array_length(string_to_array(p.nome_completo, ' '), 1))
        ) > 0.3
        OR levenshtein(upper(p.nome_completo), upper(pessoa_dados.nome_completo)) <= 3
      )
    LIMIT 5;

    -- Buscar possíveis filhos (pessoas mais novas com nomes similares)  
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'nome', p.nome_completo,
        'idade', EXTRACT(YEAR FROM AGE(p.data_nascimento)),
        'similaridade', similarity(
          split_part(pessoa_dados.nome_completo, ' ', array_length(string_to_array(pessoa_dados.nome_completo, ' '), 1)),
          split_part(p.nome_completo, ' ', array_length(string_to_array(p.nome_completo, ' '), 1))
        ),
        'motivo', 'Sobrenome similar e idade compatível para ser filho(a)'
      )
    )
    INTO possíveis_filhos
    FROM pessoas p
    WHERE p.id != pessoa_dados.id
      AND p.situacao = 'ativo'
      AND p.church_id = pessoa_dados.church_id
      AND p.data_nascimento IS NOT NULL
      AND pessoa_dados.data_nascimento IS NOT NULL
      AND EXTRACT(YEAR FROM AGE(pessoa_dados.data_nascimento)) - EXTRACT(YEAR FROM AGE(p.data_nascimento)) >= 15
      AND EXTRACT(YEAR FROM AGE(pessoa_dados.data_nascimento)) - EXTRACT(YEAR FROM AGE(p.data_nascimento)) <= 50
      AND (
        similarity(
          split_part(pessoa_dados.nome_completo, ' ', array_length(string_to_array(pessoa_dados.nome_completo, ' '), 1)),
          split_part(p.nome_completo, ' ', array_length(string_to_array(p.nome_completo, ' '), 1))
        ) > 0.3
        OR levenshtein(upper(p.nome_completo), upper(pessoa_dados.nome_completo)) <= 3
      )
    LIMIT 5;

    resultado := jsonb_build_object(
      'pessoa', jsonb_build_object(
        'id', pessoa_dados.id,
        'nome', pessoa_dados.nome_completo,
        'idade', EXTRACT(YEAR FROM AGE(pessoa_dados.data_nascimento))
      ),
      'possiveis_pais', COALESCE(possíveis_pais, '[]'::jsonb),
      'possiveis_filhos', COALESCE(possíveis_filhos, '[]'::jsonb),
      'timestamp', now()
    );
  END IF;

  -- Análise de inconsistências gerais
  IF p_tipo_analise = 'inconsistencias' THEN
    
    -- Buscar pessoas sem vínculos familiares que poderiam ter
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'nome', p.nome_completo,
        'tipo_inconsistencia', 'sem_vinculos_familiares',
        'severidade', 'baixa',
        'sugestao', 'Verificar se esta pessoa tem familiares na igreja'
      )
    )
    INTO inconsistencias
    FROM pessoas p
    WHERE p.situacao = 'ativo'
      AND p.pai_id IS NULL 
      AND p.mae_id IS NULL
      AND p.data_nascimento IS NOT NULL
      AND EXTRACT(YEAR FROM AGE(p.data_nascimento)) < 30  -- Pessoas jovens que provavelmente têm pais
      AND EXISTS (
        SELECT 1 FROM pessoas p2 
        WHERE p2.situacao = 'ativo'
          AND p2.id != p.id
          AND p2.church_id = p.church_id
          AND similarity(
            split_part(p.nome_completo, ' ', array_length(string_to_array(p.nome_completo, ' '), 1)),
            split_part(p2.nome_completo, ' ', array_length(string_to_array(p2.nome_completo, ' '), 1))
          ) > 0.5
      )
    LIMIT 20;

    resultado := jsonb_build_object(
      'inconsistencias', COALESCE(inconsistencias, '[]'::jsonb),
      'total_encontradas', jsonb_array_length(COALESCE(inconsistencias, '[]'::jsonb)),
      'timestamp', now()
    );
  END IF;

  -- Relatório de qualidade da genealogia
  IF p_tipo_analise = 'qualidade' THEN
    resultado := jsonb_build_object(
      'metricas', jsonb_build_object(
        'total_pessoas', (SELECT COUNT(*) FROM pessoas WHERE situacao = 'ativo'),
        'com_pai', (SELECT COUNT(*) FROM pessoas WHERE situacao = 'ativo' AND pai_id IS NOT NULL),
        'com_mae', (SELECT COUNT(*) FROM pessoas WHERE situacao = 'ativo' AND mae_id IS NOT NULL),
        'com_data_nascimento', (SELECT COUNT(*) FROM pessoas WHERE situacao = 'ativo' AND data_nascimento IS NOT NULL),
        'familias_ativas', (SELECT COUNT(DISTINCT familia_id) FROM pessoas WHERE situacao = 'ativo' AND familia_id IS NOT NULL)
      ),
      'score_qualidade', (
        SELECT ROUND(
          (COUNT(CASE WHEN pai_id IS NOT NULL OR mae_id IS NOT NULL THEN 1 END) * 100.0 / 
           NULLIF(COUNT(*), 0))::numeric, 2
        )
        FROM pessoas WHERE situacao = 'ativo'
      ),
      'timestamp', now()
    );
  END IF;

  RETURN resultado;
END;
$$;

-- Função para aplicar sugestão de vínculo familiar
CREATE OR REPLACE FUNCTION public.aplicar_vinculo_familiar(
  p_pessoa_id UUID,
  p_parente_id UUID,
  p_tipo_vinculo TEXT -- 'pai', 'mae', 'filho', 'filha'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  resultado JSONB;
  pessoa_dados RECORD;
  parente_dados RECORD;
BEGIN
  -- Validar pessoas
  SELECT * INTO pessoa_dados FROM pessoas WHERE id = p_pessoa_id AND situacao = 'ativo';
  SELECT * INTO parente_dados FROM pessoas WHERE id = p_parente_id AND situacao = 'ativo';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Uma das pessoas não foi encontrada');
  END IF;

  -- Aplicar vínculo baseado no tipo
  IF p_tipo_vinculo = 'pai' THEN
    UPDATE pessoas SET pai_id = p_parente_id WHERE id = p_pessoa_id;
  ELSIF p_tipo_vinculo = 'mae' THEN
    UPDATE pessoas SET mae_id = p_parente_id WHERE id = p_pessoa_id;
  ELSIF p_tipo_vinculo IN ('filho', 'filha') THEN
    -- Se está definindo como filho, atualizar o parente como pai/mãe da pessoa
    IF parente_dados.genero = 'masculino' THEN
      UPDATE pessoas SET pai_id = p_parente_id WHERE id = p_pessoa_id;
    ELSIF parente_dados.genero = 'feminino' THEN  
      UPDATE pessoas SET mae_id = p_parente_id WHERE id = p_pessoa_id;
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Gênero do parente não definido para estabelecer vínculo pai/mãe');
    END IF;
  END IF;

  -- Log da ação
  INSERT INTO public.logs_sistema (
    acao, 
    detalhes, 
    user_id, 
    tabela_afetada
  ) VALUES (
    'vinculo_familiar_aplicado',
    jsonb_build_object(
      'pessoa_id', p_pessoa_id,
      'parente_id', p_parente_id,
      'tipo_vinculo', p_tipo_vinculo,
      'pessoa_nome', pessoa_dados.nome_completo,
      'parente_nome', parente_dados.nome_completo
    ),
    auth.uid(),
    'pessoas'
  );

  RETURN jsonb_build_object(
    'success', true,
    'vinculo_criado', jsonb_build_object(
      'pessoa', pessoa_dados.nome_completo,
      'parente', parente_dados.nome_completo,
      'tipo', p_tipo_vinculo
    )
  );
END;
$$;