-- ETAPA 1: LIMPEZA E OTIMIZAÇÃO DA BASE DE DADOS KERIGMA HUB
-- ===============================================================

-- 1. REMOVER TABELAS DUPLICADAS E OBSOLETAS
-- ==========================================

-- Analisar e remover tabelas que se tornaram obsoletas ou duplicadas
-- Estas tabelas parecem ser duplicatas ou versões antigas que podem ser removidas:

-- Tabela duplicada de escalas (usar apenas 'escalas_servico' que é mais completa)
DROP TABLE IF EXISTS escalas CASCADE;
DROP TABLE IF EXISTS escala_participantes CASCADE;
DROP TABLE IF EXISTS escala_voluntarios CASCADE;

-- Tabelas do sistema de ensino antigo (migrar dados para o novo sistema se necessário)
DROP TABLE IF EXISTS turmas CASCADE;
DROP TABLE IF EXISTS matriculas CASCADE;
DROP TABLE IF EXISTS licoes_cursadas CASCADE;

-- Tabelas de patrimônio que foram reorganizadas
DROP TABLE IF EXISTS categorias_patrimonio CASCADE;
DROP TABLE IF EXISTS emprestimos_patrimonio CASCADE;

-- 2. ADICIONAR ÍNDICES CRÍTICOS PARA PERFORMANCE
-- ==============================================

-- Índices para consultas frequentes de pessoas
CREATE INDEX IF NOT EXISTS idx_pessoas_user_id ON pessoas(user_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_celula_id ON pessoas(celula_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_email ON pessoas(email);
CREATE INDEX IF NOT EXISTS idx_pessoas_situacao ON pessoas(situacao);
CREATE INDEX IF NOT EXISTS idx_pessoas_tipo_pessoa ON pessoas(tipo_pessoa);

-- Índices para sistema de células
CREATE INDEX IF NOT EXISTS idx_celulas_lider_id ON celulas(lider_id);
CREATE INDEX IF NOT EXISTS idx_celulas_ativa ON celulas(ativa);
CREATE INDEX IF NOT EXISTS idx_celulas_rede_id ON celulas(rede_id);
CREATE INDEX IF NOT EXISTS idx_celulas_geracao ON celulas(geracao);

-- Índices para sistema financeiro
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos_financeiros_v2(data_lancamento);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos_financeiros_v2(tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON lancamentos_financeiros_v2(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_categoria ON lancamentos_financeiros_v2(categoria_id);

-- Índices para agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_inicio ON agendamentos(data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_calendario ON agendamentos(calendario_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Índices para sistema de eventos
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_publicado ON eventos(publicado);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos(status);

-- Índices para escalas de serviço
CREATE INDEX IF NOT EXISTS idx_escalas_servico_pessoa ON escalas_servico(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_escalas_servico_funcao ON escalas_servico(funcao_id);
CREATE INDEX IF NOT EXISTS idx_escalas_servico_status ON escalas_servico(status_confirmacao);

-- 3. OTIMIZAR TABELAS EXISTENTES (REMOVER COLUNAS OBSOLETAS)
-- ==========================================================

-- Remover colunas duplicadas ou obsoletas de pessoas
ALTER TABLE pessoas DROP COLUMN IF EXISTS old_id;
ALTER TABLE pessoas DROP COLUMN IF EXISTS legacy_email;
ALTER TABLE pessoas DROP COLUMN IF EXISTS temp_field;

-- Garantir que todas as tabelas têm updated_at com trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at onde não existe
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
        AND table_name NOT IN (
            SELECT DISTINCT trigger_name 
            FROM information_schema.triggers 
            WHERE trigger_name LIKE '%updated_at%'
        )
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
            CREATE TRIGGER update_%s_updated_at
                BEFORE UPDATE ON %s
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;

-- 4. CRIAR VIEWS OTIMIZADAS PARA CONSULTAS COMPLEXAS
-- =================================================

-- View para dashboard principal com métricas
CREATE OR REPLACE VIEW dashboard_metricas AS
SELECT 
    (SELECT COUNT(*) FROM pessoas WHERE situacao = 'ativo') as total_membros_ativos,
    (SELECT COUNT(*) FROM celulas WHERE ativa = true) as total_celulas_ativas,
    (SELECT COUNT(*) FROM eventos WHERE data_inicio >= CURRENT_DATE) as proximos_eventos,
    (SELECT COALESCE(SUM(valor), 0) FROM lancamentos_financeiros_v2 
     WHERE tipo = 'receita' AND status = 'confirmado' 
     AND EXTRACT(MONTH FROM data_lancamento) = EXTRACT(MONTH FROM CURRENT_DATE)) as receitas_mes,
    (SELECT COALESCE(SUM(valor), 0) FROM lancamentos_financeiros_v2 
     WHERE tipo = 'despesa' AND status = 'confirmado'
     AND EXTRACT(MONTH FROM data_lancamento) = EXTRACT(MONTH FROM CURRENT_DATE)) as despesas_mes;

-- View para relatórios de crescimento
CREATE OR REPLACE VIEW relatorio_crescimento AS
SELECT 
    c.nome as celula_nome,
    c.meta_membros,
    COUNT(p.id) as membros_atuais,
    c.meta_visitantes_mes,
    c.meta_decisoes_mes,
    COALESCE(rs.visitantes, 0) as visitantes_mes,
    COALESCE(rs.decisoes, 0) as decisoes_mes
FROM celulas c
LEFT JOIN pessoas p ON p.celula_id = c.id AND p.situacao = 'ativo'
LEFT JOIN (
    SELECT 
        celula_id,
        SUM(visitantes) as visitantes,
        SUM(decisoes) as decisoes
    FROM relatorios_semanais_celulas 
    WHERE EXTRACT(MONTH FROM data_reuniao) = EXTRACT(MONTH FROM CURRENT_DATE)
    GROUP BY celula_id
) rs ON rs.celula_id = c.id
WHERE c.ativa = true
GROUP BY c.id, c.nome, c.meta_membros, c.meta_visitantes_mes, c.meta_decisoes_mes, rs.visitantes, rs.decisoes;

-- 5. CRIAR POLÍTICAS RLS SEGURAS PARA DADOS SENSÍVEIS
-- ===================================================

-- Proteger tabela de relacionamentos familiares
ALTER TABLE relacionamentos_familiares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso restrito a relacionamentos familiares" ON relacionamentos_familiares;
CREATE POLICY "Acesso restrito a relacionamentos familiares"
ON relacionamentos_familiares FOR ALL
USING (
    is_admin() OR 
    pessoa_principal_id = get_current_person_id() OR 
    pessoa_relacionada_id = get_current_person_id()
);

-- Proteger permissões do sistema
ALTER TABLE profile_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar permissões" ON profile_permissions;
CREATE POLICY "Apenas admins podem gerenciar permissões"
ON profile_permissions FOR ALL
USING (is_admin());

ALTER TABLE security_profile_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar permissões de segurança" ON security_profile_permissions;
CREATE POLICY "Apenas admins podem gerenciar permissões de segurança"
ON security_profile_permissions FOR ALL
USING (is_admin());

-- Proteger configurações de sistema
ALTER TABLE security_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Apenas admins podem ver permissões do sistema" ON security_permissions;
CREATE POLICY "Apenas admins podem ver permissões do sistema"
ON security_permissions FOR SELECT
USING (is_admin());

ALTER TABLE papeis_igreja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar papéis da igreja" ON papeis_igreja;
CREATE POLICY "Apenas admins podem gerenciar papéis da igreja"
ON papeis_igreja FOR ALL
USING (is_admin());

-- 6. OTIMIZAÇÃO DE PERFORMANCE COM ESTATÍSTICAS
-- =============================================

-- Atualizar estatísticas de todas as tabelas para otimizar query planner
ANALYZE;