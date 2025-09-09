-- ===================================================================
-- TESTE C1: Primeiro Relatório Semanal de Célula (TESTE)
-- ===================================================================

-- Inserir um relatório de teste para verificar funcionalidade do módulo células
INSERT INTO relatorios_semanais_celulas (
    celula_id,
    data_reuniao,
    presentes,
    visitantes,
    decisoes,
    ofertas,
    observacoes,
    status
) 
VALUES (
    (SELECT id FROM celulas WHERE ativa = true LIMIT 1),
    CURRENT_DATE,
    8,
    2,
    1,
    50.00,
    'TESTE QA - Primeiro relatório do sistema de células',
    'pendente'
);