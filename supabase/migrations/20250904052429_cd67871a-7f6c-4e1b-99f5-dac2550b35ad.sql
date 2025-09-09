-- ===================================================================
-- ATUALIZAR STATUS DOS MÓDULOS - AUDITORIA COMPLETA 5 MÓDULOS
-- ===================================================================

-- Atualizar status do módulo ENSINO (agora funcional)
UPDATE public.modulo_status 
SET status = 'funcional',
    observacoes = 'Teste E1 executado com sucesso - Matrícula ativa criada para Kauê Marinho na turma Fundamentos da Fé',
    data_atualizacao = CURRENT_TIMESTAMP
WHERE nome_modulo = 'ensino';

-- Atualizar status do módulo EVENTOS (agora funcional)  
UPDATE public.modulo_status
SET status = 'funcional',
    observacoes = 'Teste V1 executado com sucesso - Participação criada na Conferência da Família',
    data_atualizacao = CURRENT_TIMESTAMP
WHERE nome_modulo = 'eventos';

-- Inserir registros se não existirem
INSERT INTO public.modulo_status (nome_modulo, status, observacoes, data_atualizacao)
SELECT 'ensino', 'funcional', 
       'Teste E1 executado com sucesso - Sistema de matrículas operacional', 
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM modulo_status WHERE nome_modulo = 'ensino')
UNION ALL
SELECT 'eventos', 'funcional',
       'Teste V1 executado com sucesso - Sistema de participações operacional',
       CURRENT_TIMESTAMP  
WHERE NOT EXISTS (SELECT 1 FROM modulo_status WHERE nome_modulo = 'eventos');