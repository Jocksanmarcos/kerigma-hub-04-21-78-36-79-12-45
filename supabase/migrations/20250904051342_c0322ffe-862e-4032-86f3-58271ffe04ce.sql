-- ===================================================================
-- TESTE C1: PRIMEIRO RELATÓRIO SEMANAL DE CÉLULA - VERSÃO CORRIGIDA
-- ===================================================================

-- Inserir relatório de teste com status mais simples
INSERT INTO relatorios_semanais_celulas (
  celula_id,
  data_reuniao,
  presencas,
  visitantes,
  palavra_ministrada,
  oferta_arrecadada,
  motivos_oracao,
  decisoes_cristo,
  batismos_agendados,
  status
)
SELECT 
  c.id,
  CURRENT_DATE - INTERVAL '3 days', -- Reunião da última sexta
  '{"adultos": 8, "jovens": 3, "criancas": 2, "total": 13}'::jsonb,
  '{"nomes": ["Maria Silva", "João Santos"], "total": 2}'::jsonb,
  'Estudo sobre Fé - Hebreus 11:1-6',
  75.50,
  'Saúde da irmã Ana, emprego do irmão Pedro, paz familiar',
  1,
  1,
  'pendente'
FROM celulas c
WHERE c.nome = 'Célula Esperança' 
  AND c.ativa = true
LIMIT 1;