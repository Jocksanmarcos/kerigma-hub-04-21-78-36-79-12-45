-- Fix seeds: fill required column "nome" on trilhas_formacao
WITH upsert_trilha AS (
  INSERT INTO public.trilhas_formacao (slug, titulo, nome, ordem, ativo)
  VALUES ('001-dna-track', 'Trilho de Treinamento DNA', 'Trilho de Treinamento DNA', 1, true)
  ON CONFLICT (slug) DO UPDATE 
    SET titulo = EXCLUDED.titulo,
        nome = EXCLUDED.nome,
        ordem = EXCLUDED.ordem,
        ativo = EXCLUDED.ativo
  RETURNING id as trilha_id
),
upsert_cursos AS (
  INSERT INTO public.cursos (slug, nome, ordem, trilha_id, ativo)
  SELECT 'curso-descubra', 'Descubra', 1, trilha_id, true FROM upsert_trilha
  UNION ALL SELECT 'curso-dna-celulas', 'DNA da Igreja em Células', 2, (SELECT trilha_id FROM upsert_trilha), true
  UNION ALL SELECT 'curso-dna-discipulado', 'DNA do Discipulado', 3, (SELECT trilha_id FROM upsert_trilha), true
  UNION ALL SELECT 'curso-dna-lideranca', 'DNA da Liderança', 4, (SELECT trilha_id FROM upsert_trilha), true
  ON CONFLICT (slug) DO UPDATE SET nome=EXCLUDED.nome, trilha_id=EXCLUDED.trilha_id, ordem=EXCLUDED.ordem, ativo=EXCLUDED.ativo
  RETURNING id, slug
),
ids AS (
  SELECT 
    (SELECT id FROM upsert_cursos WHERE slug='curso-descubra') as curso_descubra,
    (SELECT id FROM upsert_cursos WHERE slug='curso-dna-celulas') as curso_dna_celulas,
    (SELECT id FROM upsert_cursos WHERE slug='curso-dna-discipulado') as curso_dna_discipulado,
    (SELECT id FROM upsert_cursos WHERE slug='curso-dna-lideranca') as curso_dna_lideranca
)
INSERT INTO public.licoes (curso_id, titulo, ordem, ativo)
SELECT curso_descubra, 'Aula 1: O Encontro', 1, true FROM ids
UNION ALL SELECT curso_descubra, 'Aula 2: A Descoberta', 2, true FROM ids
UNION ALL SELECT curso_descubra, 'Aula 3: O Chamado', 3, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 1: O que é a Igreja?', 1, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 2: A Visão Celular', 2, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 3: O Ganhar', 3, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 4: O Consolidar', 4, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 5: O Discipular', 5, true FROM ids
UNION ALL SELECT curso_dna_celulas, 'Aula 6: O Enviar', 6, true FROM ids
ON CONFLICT DO NOTHING;