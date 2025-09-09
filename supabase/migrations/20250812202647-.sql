-- Corrigir migração - Studio de Produção de Cultos
-- A tabela já existe, precisamos apenas inserir os dados corretamente

-- Inserir dados padrão na tabela existente
INSERT INTO public.louvor_presets_ambiente (
  nome_preset, tonalidade_base, bpm, volume_pad, volume_pratos, volume_bumbo, volume_vocoder,
  descricao, publico, configuracao_json
)
SELECT 
  'Entrada Suave',
  'C',
  65,
  70,
  20,
  10,
  40,
  'Ambiente suave para recepção e entrada dos fiéis',
  true,
  '{"layers": [{"nome": "Pad Strings", "volume": 0.7}, {"nome": "Piano Ambiente", "volume": 0.4}]}'
WHERE NOT EXISTS (SELECT 1 FROM public.louvor_presets_ambiente WHERE nome_preset = 'Entrada Suave');

INSERT INTO public.louvor_presets_ambiente (
  nome_preset, tonalidade_base, bpm, volume_pad, volume_pratos, volume_bumbo, volume_vocoder,
  descricao, publico, configuracao_json
)
SELECT 
  'Adoração Intensa',
  'D',
  85,
  90,
  60,
  70,
  30,
  'Ambiente para momentos de adoração profunda',
  true,
  '{"layers": [{"nome": "Strings Épicos", "volume": 0.9}, {"nome": "Chuva de Reverb", "volume": 0.6}]}'
WHERE NOT EXISTS (SELECT 1 FROM public.louvor_presets_ambiente WHERE nome_preset = 'Adoração Intensa');

-- Inserir música de exemplo se não existir
INSERT INTO public.louvor_musicas (titulo, artista, categoria, tonalidade, bpm, tags, letra, created_by)
SELECT 
  'Grande é o Senhor',
  'Ministério Vineyard',
  'adoracao',
  'G',
  72,
  'adoração, clássico, congregacional',
  'Grande é o Senhor e mui digno de ser louvado
Na cidade do nosso Deus, no seu santo monte
Formoso de situação, a alegria de toda terra...',
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.louvor_musicas WHERE titulo = 'Grande é o Senhor');

SELECT 'Dados padrão inseridos com sucesso!' as resultado;