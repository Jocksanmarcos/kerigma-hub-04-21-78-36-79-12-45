-- Desabilitar a segurança de linha temporariamente para permitir a inserção via script
ALTER TABLE public.cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas DISABLE ROW LEVEL SECURITY;

-- Variável para armazenar o ID do curso atual
DO $$
DECLARE
  curso_id_atual UUID;
BEGIN

-- === CURSO 1: DISCIPULADO BÁSICO ===
INSERT INTO public.cursos (nome, descricao, status, pontos_xp_recompensa, categoria, nivel, ativo)
VALUES ('Discipulado Nível 1: Fundamentos da Fé', 'Uma jornada pelos pilares essenciais da fé cristã, ideal para novos convertidos e membros que desejam fortalecer suas bases.', 'publicado', 500, 'discipulado', 'iniciante', true)
RETURNING id INTO curso_id_atual;

INSERT INTO public.aulas (curso_id, titulo_aula, ordem, tipo_conteudo, conteudo_principal, duracao_minutos)
VALUES
  (curso_id_atual, 'Aula 1: Quem é Deus? A Trindade', 1, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 30),
  (curso_id_atual, 'Aula 2: A Autoridade da Bíblia', 2, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 25),
  (curso_id_atual, 'Aula 3: Salvação, Arrependimento e Fé', 3, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 35),
  (curso_id_atual, 'Aula 4: A Importância da Oração', 4, 'quiz', 'QUIZ_DISC_1', 15);

-- === CURSO 2: EVANGELISMO INTENCIONAL ===
INSERT INTO public.cursos (nome, descricao, status, pontos_xp_recompensa, categoria, nivel, ativo)
VALUES ('Evangelismo Intencional e Impactante', 'Aprenda a compartilhar sua fé de forma natural, relevante e poderosa no seu dia a dia.', 'publicado', 750, 'ministerio', 'intermediario', true)
RETURNING id INTO curso_id_atual;

INSERT INTO public.aulas (curso_id, titulo_aula, ordem, tipo_conteudo, conteudo_principal, duracao_minutos)
VALUES
  (curso_id_atual, 'Aula 1: A Grande Comissão é para Mim?', 1, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 30),
  (curso_id_atual, 'Aula 2: Contando sua História (Testemunho Pessoal)', 2, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 25),
  (curso_id_atual, 'Aula 3: Superando o Medo e a Insegurança', 3, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 30);

-- === CURSO 3: CURSO SOBRE A BÍBLIA (PANORAMA) ===
INSERT INTO public.cursos (nome, descricao, status, pontos_xp_recompensa, categoria, nivel, ativo)
VALUES ('Panorama Bíblico: Uma Viagem de Gênesis a Apocalipse', 'Entenda a grande narrativa da Bíblia, conectando os livros, as alianças e o plano de Deus para a humanidade.', 'publicado', 1000, 'teologia', 'intermediario', true)
RETURNING id INTO curso_id_atual;

INSERT INTO public.aulas (curso_id, titulo_aula, ordem, tipo_conteudo, conteudo_principal, duracao_minutos)
VALUES
  (curso_id_atual, 'Aula 1: O Pentateuco - A Fundação', 1, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 40),
  (curso_id_atual, 'Aula 2: Os Profetas - A Voz de Deus para a Nação', 2, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 35),
  (curso_id_atual, 'Aula 3: Os Evangelhos - A Vida de Cristo', 3, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 45),
  (curso_id_atual, 'Aula 4: As Epístolas - A Doutrina da Igreja', 4, 'video', '[Placeholder para link de vídeo do YouTube/Vimeo]', 40);

-- === CURSO 4: CURSO DE BATISMO ===
INSERT INTO public.cursos (nome, descricao, status, pontos_xp_recompensa, categoria, nivel, ativo)
VALUES ('Curso de Batismo: Mergulhando na Nova Vida', 'Um curso preparatório completo sobre o significado e a importância do batismo, conforme as doutrinas batistas.', 'publicado', 300, 'discipulado', 'iniciante', true)
RETURNING id INTO curso_id_atual;

INSERT INTO public.aulas (curso_id, titulo_aula, ordem, tipo_conteudo, conteudo_principal, duracao_minutos)
VALUES
  (curso_id_atual, 'Aula 1: O que é o Batismo?', 1, 'video', '[Placeholder: Conteúdo a ser inserido pela liderança pastoral]', 20),
  (curso_id_atual, 'Aula 2: Por que devo me Batizar?', 2, 'video', '[Placeholder: Conteúdo a ser inserido pela liderança pastoral]', 25),
  (curso_id_atual, 'Aula 3: O Testemunho Público da Fé', 3, 'video', '[Placeholder: Conteúdo a ser inserido pela liderança pastoral]', 20);

-- === CURSO 5: CURSOS DNA (ESTRUTURA) ===
INSERT INTO public.cursos (nome, descricao, status, pontos_xp_recompensa, categoria, nivel, ativo)
VALUES ('DNA Kerigma: Nossa Identidade', 'Estrutura para os cursos do DNA da igreja. [Conteúdo a ser inserido pela liderança, com a devida permissão, se aplicável]', 'rascunho', 600, 'lideranca', 'avancado', true)
RETURNING id INTO curso_id_atual;

INSERT INTO public.aulas (curso_id, titulo_aula, ordem, tipo_conteudo, duracao_minutos)
VALUES
  (curso_id_atual, 'DNA 101 - Descobrindo a Família da Fé', 1, 'video', 30),
  (curso_id_atual, 'DNA 201 - Crescendo em Maturidade', 2, 'video', 30),
  (curso_id_atual, 'DNA 301 - Servindo no Ministério', 3, 'video', 30),
  (curso_id_atual, 'DNA 401 - Vivendo em Missão', 4, 'video', 30);

END $$;

-- Reabilitar a segurança de linha
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;