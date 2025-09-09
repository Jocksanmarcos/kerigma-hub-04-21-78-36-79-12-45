-- Add missing fields to pessoas table
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS genero text;

-- Create function to import the provided data
CREATE OR REPLACE FUNCTION import_pessoas_data()
RETURNS void AS $$
DECLARE
    pessoa_data jsonb := '[
  {
    "nome_completo": "Adeval Cordeiro",
    "email": "advmneto@gmail.com",
    "telefone": "98981267938",
    "situacao": "ativo",
    "estado_espiritual": "interessado",
    "data_nascimento": "1979-03-24",
    "endereco": "Rua 20 Quadra 32, 9, Jardim Alvorada, Maranhao",
    "estado_civil": "casado",
    "genero": "masculino"
  },
  {
    "nome_completo": "Agostinha Araújo Pereira",
    "email": "agostinhap@yahoo.com.br",
    "telefone": "98981919202",
    "situacao": "ativo",
    "estado_espiritual": "convertido",
    "data_nascimento": "1954-03-24",
    "data_conversao": "1987-09-12",
    "endereco": "Estrada de Ribamar, Km 2, 5, Aurora, Maranhao",
    "estado_civil": "casado",
    "genero": "feminino"
  },
  {
    "nome_completo": "Alice Zacheu",
    "email": "alicepzacheu63@gmail.com",
    "telefone": "98981573303",
    "situacao": "ativo",
    "estado_espiritual": "interessado",
    "data_nascimento": "1965-04-21",
    "endereco": "Rua 1, Quadra 1, Planalto Anil, 10, Aurora, Maranhao",
    "estado_civil": "casado",
    "genero": "feminino"
  },
  {
    "nome_completo": "Ana Lara Passos",
    "email": "passosanalara8@gmail.com",
    "telefone": "98991386416",
    "situacao": "ativo",
    "estado_espiritual": "batizado",
    "data_nascimento": "2011-10-08",
    "data_batismo": "2024-06-30",
    "data_conversao": "2024-01-11",
    "endereco": "Rua Val Divino Castelo Branco, 22, Aurora, Maranhao",
    "estado_civil": "solteiro",
    "genero": "feminino"
  },
  {
    "nome_completo": "Antenor Barros",
    "email": "antenor.neto@ma.aluno.senai.br",
    "telefone": "988159590",
    "situacao": "ativo",
    "estado_espiritual": "interessado",
    "data_nascimento": "1984-01-01",
    "endereco": "Rua 16 casa25 quadra 32, Cohatrac 3 , Maranhao",
    "estado_civil": "divorciado",
    "genero": "masculino"
  }
]'::jsonb;
    pessoa jsonb;
BEGIN
    FOR pessoa IN SELECT * FROM jsonb_array_elements(pessoa_data)
    LOOP
        INSERT INTO pessoas (
            nome_completo, email, telefone, situacao, estado_espiritual,
            data_nascimento, data_batismo, data_conversao, endereco, 
            estado_civil, genero, tipo_pessoa
        ) VALUES (
            pessoa->>'nome_completo',
            pessoa->>'email',
            pessoa->>'telefone',
            COALESCE(pessoa->>'situacao', 'ativo'),
            COALESCE(pessoa->>'estado_espiritual', 'interessado'),
            CASE WHEN pessoa->>'data_nascimento' IS NOT NULL 
                 THEN (pessoa->>'data_nascimento')::date 
                 ELSE NULL END,
            CASE WHEN pessoa->>'data_batismo' IS NOT NULL 
                 THEN (pessoa->>'data_batismo')::date 
                 ELSE NULL END,
            CASE WHEN pessoa->>'data_conversao' IS NOT NULL 
                 THEN (pessoa->>'data_conversao')::date 
                 ELSE NULL END,
            pessoa->>'endereco',
            pessoa->>'estado_civil',
            pessoa->>'genero',
            'membro'
        )
        ON CONFLICT (email) DO UPDATE SET
            nome_completo = EXCLUDED.nome_completo,
            telefone = EXCLUDED.telefone,
            situacao = EXCLUDED.situacao,
            estado_espiritual = EXCLUDED.estado_espiritual,
            data_nascimento = EXCLUDED.data_nascimento,
            data_batismo = EXCLUDED.data_batismo,
            data_conversao = EXCLUDED.data_conversao,
            endereco = EXCLUDED.endereco,
            estado_civil = EXCLUDED.estado_civil,
            genero = EXCLUDED.genero,
            updated_at = now();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the import
SELECT import_pessoas_data();