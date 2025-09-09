-- ===================================================================
-- AUDITORIA MÓDULOS ENSINO E EVENTOS - CORREÇÕES CRÍTICAS (CORRIGIDA)
-- ===================================================================

-- TESTE E1: Criar primeira matrícula ativa no sistema de ensino
-- Precisa usar turma_id, não curso_id
INSERT INTO public.matriculas_ensino (
  pessoa_id, 
  turma_id, 
  status, 
  data_matricula,
  frequencia_percentual
)
SELECT 
  (SELECT id FROM pessoas WHERE situacao = 'ativo' ORDER BY created_at DESC LIMIT 1) as pessoa_id,
  (SELECT id FROM turmas_ensino WHERE status IN ('planejado', 'em_andamento') LIMIT 1) as turma_id,
  'ativo' as status,
  CURRENT_DATE as data_matricula,
  0 as frequencia_percentual
WHERE EXISTS (SELECT 1 FROM turmas_ensino WHERE status IN ('planejado', 'em_andamento'))
AND NOT EXISTS (
  SELECT 1 FROM matriculas_ensino 
  WHERE status = 'ativo' 
  AND pessoa_id = (SELECT id FROM pessoas WHERE situacao = 'ativo' ORDER BY created_at DESC LIMIT 1)
  AND turma_id = (SELECT id FROM turmas_ensino WHERE status IN ('planejado', 'em_andamento') LIMIT 1)
);

-- TESTE V1: Registrar primeira participação em evento  
-- Usar estrutura correta da tabela participacao_eventos
INSERT INTO public.participacao_eventos (
  evento_id,
  nome,
  email, 
  telefone,
  status
)
SELECT 
  (SELECT id FROM eventos WHERE publico = true ORDER BY data_inicio DESC LIMIT 1) as evento_id,
  p.nome_completo as nome,
  p.email,
  p.telefone,
  'confirmado' as status
FROM pessoas p
WHERE p.situacao = 'ativo' 
AND p.email IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM participacao_eventos pe
  WHERE pe.evento_id = (SELECT id FROM eventos WHERE publico = true ORDER BY data_inicio DESC LIMIT 1)
  AND pe.email = p.email
)
LIMIT 1;