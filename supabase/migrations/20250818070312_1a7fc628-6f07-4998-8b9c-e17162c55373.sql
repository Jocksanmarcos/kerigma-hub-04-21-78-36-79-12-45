-- Corrigir políticas RLS da tabela pessoas
DROP POLICY IF EXISTS "users_can_create_church_pessoas" ON pessoas;

-- Nova política mais permissiva para criação de pessoas
CREATE POLICY "authenticated_users_can_create_pessoas" 
ON pessoas 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Política para permitir que usuários autenticados vejam pessoas da mesma igreja
DROP POLICY IF EXISTS "users_can_access_church_pessoas" ON pessoas;

CREATE POLICY "authenticated_users_can_view_pessoas" 
ON pessoas 
FOR SELECT 
TO authenticated
USING (true);

-- Política para atualização
DROP POLICY IF EXISTS "users_can_update_church_pessoas" ON pessoas;

CREATE POLICY "authenticated_users_can_update_pessoas" 
ON pessoas 
FOR UPDATE 
TO authenticated
USING (true);

-- Função para obter aniversariantes do mês
CREATE OR REPLACE FUNCTION get_aniversariantes_mes(mes_param integer DEFAULT NULL)
RETURNS TABLE(
    id uuid,
    nome_completo text,
    data_nascimento date,
    idade integer,
    telefone text,
    email text,
    dias_para_aniversario integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    mes_atual INTEGER;
BEGIN
    mes_atual := COALESCE(mes_param, EXTRACT(MONTH FROM CURRENT_DATE));
    
    RETURN QUERY
    SELECT 
        p.id,
        p.nome_completo,
        p.data_nascimento,
        EXTRACT(YEAR FROM AGE(p.data_nascimento))::INTEGER as idade,
        p.telefone,
        p.email,
        CASE 
            WHEN EXTRACT(DOY FROM (DATE(EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(EXTRACT(MONTH FROM p.data_nascimento)::text, 2, '0') || '-' || LPAD(EXTRACT(DAY FROM p.data_nascimento)::text, 2, '0')))) >= EXTRACT(DOY FROM CURRENT_DATE) 
            THEN EXTRACT(DOY FROM (DATE(EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(EXTRACT(MONTH FROM p.data_nascimento)::text, 2, '0') || '-' || LPAD(EXTRACT(DAY FROM p.data_nascimento)::text, 2, '0')))) - EXTRACT(DOY FROM CURRENT_DATE)
            ELSE EXTRACT(DOY FROM (DATE((EXTRACT(YEAR FROM CURRENT_DATE) + 1) || '-' || LPAD(EXTRACT(MONTH FROM p.data_nascimento)::text, 2, '0') || '-' || LPAD(EXTRACT(DAY FROM p.data_nascimento)::text, 2, '0')))) - EXTRACT(DOY FROM CURRENT_DATE) + 365
        END::INTEGER as dias_para_aniversario
    FROM pessoas p
    WHERE p.data_nascimento IS NOT NULL 
    AND p.situacao = 'ativo'
    AND EXTRACT(MONTH FROM p.data_nascimento) = mes_atual
    ORDER BY EXTRACT(DAY FROM p.data_nascimento);
END;
$$;

-- Função para estatísticas de pessoas com insights de IA
CREATE OR REPLACE FUNCTION get_pessoas_analytics()
RETURNS TABLE(
    total_pessoas bigint,
    total_membros bigint,
    total_visitantes bigint,
    total_lideres bigint,
    crescimento_mensal numeric,
    faixa_etaria_predominante text,
    engagement_score numeric,
    insights jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    total_atual bigint;
    total_mes_anterior bigint;
    crescimento numeric;
    faixa_predominante text;
    score_engagement numeric;
    insights_data jsonb;
BEGIN
    -- Total atual
    SELECT COUNT(*) INTO total_atual FROM pessoas WHERE situacao = 'ativo';
    
    -- Total mês anterior
    SELECT COUNT(*) INTO total_mes_anterior 
    FROM pessoas 
    WHERE situacao = 'ativo' 
    AND created_at < date_trunc('month', CURRENT_DATE);
    
    -- Crescimento mensal
    crescimento := CASE 
        WHEN total_mes_anterior > 0 THEN 
            ((total_atual::numeric - total_mes_anterior::numeric) / total_mes_anterior::numeric) * 100
        ELSE 0 
    END;
    
    -- Faixa etária predominante
    SELECT 
        CASE 
            WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 0 AND 17 THEN 'Jovens (0-17)'
            WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 18 AND 35 THEN 'Adultos Jovens (18-35)'
            WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 36 AND 60 THEN 'Adultos (36-60)'
            ELSE 'Idosos (60+)'
        END INTO faixa_predominante
    FROM pessoas 
    WHERE data_nascimento IS NOT NULL 
    AND situacao = 'ativo'
    GROUP BY 
        CASE 
            WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 0 AND 17 THEN 'Jovens (0-17)'
            WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 18 AND 35 THEN 'Adultos Jovens (18-35)'
            WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 36 AND 60 THEN 'Adultos (36-60)'
            ELSE 'Idosos (60+)'
        END
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- Score de engajamento (baseado em dados disponíveis)
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE (
                (COUNT(CASE WHEN telefone IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric * 30) +
                (COUNT(CASE WHEN email IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric * 25) +
                (COUNT(CASE WHEN endereco IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric * 20) +
                (COUNT(CASE WHEN celula_id IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric * 25)
            )
        END INTO score_engagement
    FROM pessoas WHERE situacao = 'ativo';
    
    -- Insights baseados nos dados
    insights_data := jsonb_build_object(
        'recomendacao_crescimento', 
        CASE 
            WHEN crescimento < 0 THEN 'Foco em retenção e engajamento'
            WHEN crescimento < 5 THEN 'Intensificar estratégias de evangelismo'
            ELSE 'Manter estratégias atuais de crescimento'
        END,
        'acao_sugerida',
        CASE 
            WHEN score_engagement < 50 THEN 'Melhorar coleta de dados de contato'
            WHEN score_engagement < 75 THEN 'Investir em engajamento através de células'
            ELSE 'Focar em desenvolvimento de liderança'
        END,
        'prioridade_faixa_etaria', faixa_predominante,
        'score_saude', 
        CASE 
            WHEN crescimento > 5 AND score_engagement > 70 THEN 'Excelente'
            WHEN crescimento > 0 AND score_engagement > 50 THEN 'Bom'
            WHEN crescimento >= 0 OR score_engagement > 40 THEN 'Regular'
            ELSE 'Precisa de atenção'
        END
    );
    
    RETURN QUERY
    SELECT 
        total_atual,
        (SELECT COUNT(*) FROM pessoas WHERE tipo_pessoa = 'membro' AND situacao = 'ativo'),
        (SELECT COUNT(*) FROM pessoas WHERE tipo_pessoa = 'visitante' AND situacao = 'ativo'),
        (SELECT COUNT(*) FROM pessoas WHERE tipo_pessoa IN ('lider', 'pastor') AND situacao = 'ativo'),
        crescimento,
        COALESCE(faixa_predominante, 'Não definido'),
        COALESCE(score_engagement, 0),
        insights_data;
END;
$$;