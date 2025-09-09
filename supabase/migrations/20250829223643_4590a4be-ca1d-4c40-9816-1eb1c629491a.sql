-- Script para popular a plataforma com um curso de exemplo completo
-- Inserir curso principal e suas aulas com quiz

DO $$
DECLARE
    v_curso_id uuid;
BEGIN
    -- 1. Insere o Curso Principal
    INSERT INTO public.cursos (nome, descricao, status, pontos_xp_recompensa, ativo, emite_certificado, nivel, categoria)
    VALUES ('Como Estudar a Bíblia', 'Aprenda métodos práticos para aprofundar seu conhecimento e relacionamento com Deus através da Palavra.', 'publicado', 500, true, true, 'iniciante', 'discipulado')
    RETURNING id INTO v_curso_id;

    -- 2. Insere as Aulas do Curso
    INSERT INTO public.aulas (curso_id, titulo_aula, ordem, tipo_conteudo, conteudo_principal, material_extra_url, duracao_minutos)
    VALUES
        (v_curso_id, 'Aula 1: A Importância da Leitura Diária', 1, 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://link.para/apostila1.pdf', 30),
        (v_curso_id, 'Aula 2: Ferramentas de Estudo', 2, 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://link.para/apostila2.pdf', 45),
        (v_curso_id, 'Aula 3: O Método Indutivo', 3, 'quiz', 'QUIZ_ID_METODO_INDUTIVO', null, 20);

    -- 3. Insere as Perguntas do Quiz para a Aula 3
    INSERT INTO public.biblia_quiz_perguntas (reference_id, texto_pergunta, opcoes, resposta_correta)
    VALUES
        ('QUIZ_ID_METODO_INDUTIVO', 'Qual é o primeiro passo do método indutivo de estudo bíblico?', '[{"id": "A", "texto": "Aplicação"}, {"id": "B", "texto": "Observação"}, {"id": "C", "texto": "Interpretação"}]'::jsonb, 'B'),
        ('QUIZ_ID_METODO_INDUTIVO', 'Fazer a pergunta "O que este texto significou para os seus leitores originais?" faz parte de qual etapa?', '[{"id": "A", "texto": "Aplicação"}, {"id": "B", "texto": "Observação"}, {"id": "C", "texto": "Interpretação"}]'::jsonb, 'C');

    RAISE NOTICE 'Curso "Como Estudar a Bíblia" criado com sucesso com ID: %', v_curso_id;
END $$;