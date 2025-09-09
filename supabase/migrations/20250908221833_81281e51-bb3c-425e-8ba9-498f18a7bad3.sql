-- Inserir seções de exemplo na página Home
INSERT INTO secoes_pagina (id, pagina_id, tipo_secao, ordem, status) VALUES 
(gen_random_uuid(), 'f507fa11-798b-4190-b762-6e21181bd5ad', 'hero-banner', 1, 'publicado'),
(gen_random_uuid(), 'f507fa11-798b-4190-b762-6e21181bd5ad', 'welcome-section', 2, 'publicado'),
(gen_random_uuid(), 'f507fa11-798b-4190-b762-6e21181bd5ad', 'sermons-section', 3, 'publicado'),
(gen_random_uuid(), 'f507fa11-798b-4190-b762-6e21181bd5ad', 'events-section', 4, 'publicado');

-- Inserir blocos de conteúdo de exemplo para a seção CTA
WITH cta_section AS (
  INSERT INTO secoes_pagina (id, pagina_id, tipo_secao, ordem, status) VALUES 
  (gen_random_uuid(), 'f507fa11-798b-4190-b762-6e21181bd5ad', 'cta-section', 5, 'publicado')
  RETURNING id
)
INSERT INTO blocos_conteudo (secao_id, tipo_bloco, conteudo_json, ordem) 
SELECT 
  cta_section.id,
  'titulo',
  '{"texto": "Venha Fazer Parte da Nossa Comunidade"}',
  1
FROM cta_section
UNION ALL
SELECT 
  cta_section.id,
  'paragrafo', 
  '{"texto": "Descubra o amor de Deus e encontre sua família espiritual conosco."}',
  2
FROM cta_section
UNION ALL
SELECT 
  cta_section.id,
  'botao',
  '{"texto": "Saiba Mais", "url": "/sobre"}',
  3
FROM cta_section;