-- Inserir versões da Bíblia em português do Brasil
INSERT INTO biblia_versoes (id, nome, abreviacao, codigo_versao, descricao, editora, ano_publicacao, ativa, ordem_exibicao) VALUES
('arc', 'Almeida Revista e Corrigida', 'ARC', 'arc', 'Versão tradicional e amplamente conhecida', 'Sociedade Bíblica do Brasil', 1995, true, 1),
('ara', 'Almeida Revista e Atualizada', 'ARA', 'ara', 'Versão com linguagem atualizada', 'Sociedade Bíblica do Brasil', 1993, true, 2),
('nvi', 'Nova Versão Internacional', 'NVI', 'nvi', 'Tradução moderna e dinâmica', 'Editora Vida', 2000, true, 3),
('ntlh', 'Nova Tradução na Linguagem de Hoje', 'NTLH', 'ntlh', 'Linguagem simples e atual', 'Sociedade Bíblica do Brasil', 2000, true, 4)
ON CONFLICT (id) DO UPDATE SET
nome = EXCLUDED.nome,
abreviacao = EXCLUDED.abreviacao,
descricao = EXCLUDED.descricao,
editora = EXCLUDED.editora,
ano_publicacao = EXCLUDED.ano_publicacao,
ativa = EXCLUDED.ativa,
ordem_exibicao = EXCLUDED.ordem_exibicao;