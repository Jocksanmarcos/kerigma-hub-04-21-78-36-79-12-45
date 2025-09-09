-- ===================================================================
-- AUDITORIA MÓDULOS ENSINO E EVENTOS - CORREÇÕES CRÍTICAS
-- ===================================================================

-- TESTE E1: Criar primeira matrícula ativa no sistema de ensino
-- Buscar primeiro curso ativo e primeira pessoa disponível
INSERT INTO public.matriculas_ensino (
  pessoa_id, 
  curso_id, 
  status, 
  data_matricula,
  progresso_percent
)
SELECT 
  (SELECT id FROM pessoas WHERE situacao = 'ativo' LIMIT 1) as pessoa_id,
  (SELECT id FROM cursos WHERE ativo = true LIMIT 1) as curso_id,
  'ativo' as status,
  CURRENT_DATE as data_matricula,
  0 as progresso_percent
WHERE NOT EXISTS (
  SELECT 1 FROM matriculas_ensino 
  WHERE status = 'ativo' 
  AND pessoa_id = (SELECT id FROM pessoas WHERE situacao = 'ativo' LIMIT 1)
  AND curso_id = (SELECT id FROM cursos WHERE ativo = true LIMIT 1)
);

-- TESTE V1: Registrar primeira participação em evento  
-- Criar participação no evento mais recente
INSERT INTO public.participacao_eventos (
  evento_id,
  pessoa_id,
  data_inscricao,
  status_participacao
)
SELECT 
  (SELECT id FROM eventos WHERE publico = true ORDER BY data_inicio DESC LIMIT 1) as evento_id,
  (SELECT id FROM pessoas WHERE situacao = 'ativo' LIMIT 1) as pessoa_id,
  CURRENT_TIMESTAMP as data_inscricao,
  'confirmado' as status_participacao
WHERE NOT EXISTS (
  SELECT 1 FROM participacao_eventos 
  WHERE evento_id = (SELECT id FROM eventos WHERE publico = true ORDER BY data_inicio DESC LIMIT 1)
  AND pessoa_id = (SELECT id FROM pessoas WHERE situacao = 'ativo' LIMIT 1)
);