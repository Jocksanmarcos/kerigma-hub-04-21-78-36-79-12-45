-- Criar registros na tabela biblia_capitulos baseado nos versículos existentes
INSERT INTO biblia_capitulos (id, livro_id, numero, versao_id, titulo, total_versiculos)
SELECT 
    livro_id || '_' || capitulo AS id,
    livro_id,
    capitulo AS numero,
    versao_id,
    CASE 
        WHEN livro_id = 'genesis' THEN 'Gênesis ' || capitulo
        WHEN livro_id = 'exodus' THEN 'Êxodo ' || capitulo  
        WHEN livro_id = 'deuteronomy' THEN 'Deuteronômio ' || capitulo
        WHEN livro_id = 'ezra' THEN 'Esdras ' || capitulo
        WHEN livro_id = 'judges' THEN 'Juízes ' || capitulo
        WHEN livro_id = 'leviticus' THEN 'Levítico ' || capitulo
        WHEN livro_id = 'nehemiah' THEN 'Neemias ' || capitulo
        WHEN livro_id = 'numbers' THEN 'Números ' || capitulo
        WHEN livro_id = 'psalms' THEN 'Salmos ' || capitulo
        ELSE INITCAP(livro_id) || ' ' || capitulo
    END AS titulo,
    COUNT(*) AS total_versiculos
FROM biblia_versiculos 
GROUP BY livro_id, capitulo, versao_id
ON CONFLICT (id) DO NOTHING;