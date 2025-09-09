-- Import the complete data set
DO $$
DECLARE
    pessoa_record record;
    temp_email text;
BEGIN
    -- Complete dataset
    FOR pessoa_record IN 
        SELECT * FROM (VALUES
            ('Adeval Cordeiro', 'advmneto@gmail.com', '98981267938', 'ativo', 'interessado', '1979-03-24'::date, null::date, null::date, 'Rua 20 Quadra 32, 9, Jardim Alvorada, Maranhao', 'casado', 'masculino', null),
            ('Agostinha Araújo Pereira', 'agostinhap@yahoo.com.br', '98981919202', 'ativo', 'convertido', '1954-03-24'::date, null::date, '1987-09-12'::date, 'Estrada de Ribamar, Km 2, 5, Aurora, Maranhao', 'casado', 'feminino', null),
            ('Alice Zacheu', 'alicepzacheu63@gmail.com', '98981573303', 'ativo', 'interessado', '1965-04-21'::date, null::date, null::date, 'Rua 1, Quadra 1, Planalto Anil, 10, Aurora, Maranhao', 'casado', 'feminino', null),
            ('Ana Lara Passos', 'passosanalara8@gmail.com', '98991386416', 'ativo', 'batizado', '2011-10-08'::date, '2024-06-30'::date, '2024-01-11'::date, 'Rua Val Divino Castelo Branco, 22, Aurora, Maranhao', 'solteiro', 'feminino', null),
            ('Antenor Barros', 'antenor.neto@ma.aluno.senai.br', '988159590', 'ativo', 'interessado', '1984-01-01'::date, null::date, null::date, 'Rua 16 casa25 quadra 32, Cohatrac 3 , Maranhao', 'divorciado', 'masculino', null),
            ('Antonio José Santos Pastor', 'antoniopastor89@gmail.com', '98981637830', 'ativo', 'convertido', '1969-04-25'::date, null::date, '1989-11-19'::date, 'Avenida: 14, 3° Conjunto., 08, Co.Hab- Anil, Maranhao', 'casado', 'masculino', null),
            ('Antonio Marques da Silva Neto', 'missaodoreinoslz@gmail.com', '98981676441', 'ativo', 'interessado', '2025-06-25'::date, null::date, null::date, 'R.Petronio Portela, 122, Forquilha, Maranhao', 'casado', 'masculino', null),
            ('Ariane Correa Castro', 'castroarianny17@gmail.com', '98984442340', 'ativo', 'interessado', '1998-12-02'::date, null::date, null::date, 'Condomínio Vitória, 68, Estrada de Ribmar, Maranhao', 'solteiro', 'feminino', null),
            ('Athon Silva Silva', 'athomicopurification+00001@noemail.cbnkerigma.local', null, 'inativo', 'interessado', '1968-01-08'::date, null::date, null::date, 'Rua 48 Quadra 15 , 1a , Maio bão , Maranhao', 'solteiro', 'masculino', null),
            ('Benjamim Araujo Barros Araujo', 'benjamim.araujo+00002@noemail.cbnkerigma.local', '98991754854', 'ativo', 'interessado', '1998-05-23'::date, null::date, null::date, 'Rua 2 quadra 24, Casa 5, Jardim Sao Cristovão 2, Maranhao', 'solteiro', 'feminino', 'Nenhuma'),
            ('Carlos Santos Araújo Martins Santos', 'carm304050@gmail.com', '988146145', 'ativo', 'interessado', '1983-01-25'::date, null::date, null::date, 'Av dos franceses, 38, Tirirical, Maranhao', 'solteiro', 'masculino', null),
            ('Catiane Santos Sousa', 'catianesousa29@gmail.com', '98981839426', 'ativo', 'batizado', '1976-02-29'::date, '2002-07-22'::date, '2002-01-01'::date, 'Rua 18, 41, Jardim Alvorada, Maranhao', 'divorciado', 'feminino', null),
            ('cbnkerigma SEDE', 'contato@cbnkerigma.org.br', '5598981550474', 'ativo', 'interessado', '2008-08-20'::date, null::date, null::date, 'Estrada de Ribamar, Km 2 , 5, Aurora , Maranhao', 'casado', 'feminino', null),
            ('Cipriano de Sousa Pereira', 'ciprianopereira@yahoo.com.br', '98982427015', 'ativo', 'interessado', '1955-09-17'::date, null::date, null::date, 'Estrada de Ribamar, Km 2 , 5, Aurora, Maranhao', 'casado', 'masculino', null),
            ('Claudia Nascimento Santos', 'nascimentosantosclaudia@gmail.com', '98988380538', 'ativo', 'interessado', '1982-04-11'::date, null::date, null::date, 'Maranhao', 'casado', 'feminino', null),
            ('Danielle Mendes Sousa', 'danny.belzinha@gmail.com', '98999746326', 'ativo', 'interessado', '1982-01-18'::date, null::date, null::date, 'RUA 18 QD 27, 50, JARDIM ALVORADA, Maranhao', 'casado', 'feminino', null),
            ('Davi Santos da Silva', 'silva.davis2005@gmail.com', '98981781909', 'ativo', 'batizado', '2005-09-20'::date, '2021-12-31'::date, null::date, 'Rua B, Q 2, 25, Jardim turu, Maranhao', 'solteiro', 'masculino', null),
            ('Emanoel Matos', 'emcmatos@gmail.com', '98987247308', 'ativo', 'batizado', '1981-10-10'::date, '2025-06-14'::date, '2019-05-24'::date, 'Maranhao', 'divorciado', 'masculino', null),
            ('Fernando Artur de Azevedo Silva', 'fernandorutra17@gmail.com', '98982606189', 'ativo', 'convertido', '2025-12-17'::date, null::date, '2025-06-27'::date, 'Rua A, Residencial Solar dos Encantos, 53, Forquilha, Maranhao', 'solteiro', 'masculino', 'Tem alergia a dipirona, ibuprofeno, cetoprofeno e diclofenaco. Tem enxaqueca, sinusite, distensão temporomandibular.'),
            ('Francisca Gomes', 'ft_gomes01@yahoo.com.br', '98988118669', 'ativo', 'interessado', '1967-10-03'::date, null::date, null::date, 'Estrada de Ribamar Km 03,  Torre orre A1, Apto 104, SN, Forquilha, Maranhao', 'casado', 'feminino', null)
        ) AS t(nome_completo, email, telefone, situacao, estado_espiritual, data_nascimento, data_batismo, data_conversao, endereco, estado_civil, genero, observacoes)
    LOOP
        INSERT INTO pessoas (
            nome_completo, email, telefone, situacao, estado_espiritual,
            data_nascimento, data_batismo, data_conversao, endereco, 
            estado_civil, genero, tipo_pessoa, observacoes
        ) VALUES (
            pessoa_record.nome_completo,
            pessoa_record.email,
            pessoa_record.telefone,
            pessoa_record.situacao,
            pessoa_record.estado_espiritual,
            pessoa_record.data_nascimento,
            pessoa_record.data_batismo,
            pessoa_record.data_conversao,
            pessoa_record.endereco,
            pessoa_record.estado_civil,
            pessoa_record.genero,
            'membro',
            pessoa_record.observacoes
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
            observacoes = EXCLUDED.observacoes,
            updated_at = now();
    END LOOP;

    -- Continue with more data...
    FOR pessoa_record IN 
        SELECT * FROM (VALUES
            ('Francisco de Assis Nunes Bezerra Nunes', 'francisco.nunes.solda@gmail.com', '98991861772', 'ativo', 'convertido', '1983-04-05'::date, null::date, '2025-07-28'::date, 'Rua santa luzia, 50, Mata de ITAPERA Maracanã, Maranhao', 'casado', 'masculino', null),
            ('GARDENIA CORREIA CARDOSO', 'gardeniacorreia0109@gmail.com', '98985125858', 'ativo', 'interessado', '1990-03-06'::date, null::date, null::date, 'Rua São Jose, 07, Mata de Itapera, Maranhao', 'solteiro', 'feminino', null),
            ('Giesa Greisy Castro de Almeida', 'giesacastro13@gmail.com', '98982956022', 'ativo', 'batizado', '1987-10-13'::date, '2024-12-06'::date, '2017-12-01'::date, 'ESTRADA DE RIBAMAR, 19, Maiobinha, Maranhao', 'casado', 'feminino', null),
            ('Gina Tainã Medeiros', 'ginataina@hotmail.com', '98988011863', 'ativo', 'convertido', '1990-02-21'::date, null::date, '2013-05-29'::date, 'Estrada de Ribamar km 2, 5F, Pingao, Maranhao', 'casado', 'feminino', null),
            ('Gracineide Fragoso da Silva', 'fragosoneide956+00003@noemail.cbnkerigma.local', null, 'ativo', 'interessado', '1960-05-01'::date, null::date, null::date, 'Maranhao', 'divorciado', 'feminino', null),
            ('Horlanne Beatriz', 'horlanneveridiano+00004@noemail.cbnkerigma.local', null, 'ativo', 'interessado', null::date, null::date, null::date, 'Maranhao', 'solteiro', 'feminino', null),
            ('Isabel Cristina Pastor', 'crys.bel@hotmail.com', '98988752054', 'ativo', 'interessado', '1977-02-06'::date, null::date, null::date, 'Cohab Anil 3, Maranhao', 'casado', 'feminino', null),
            ('Isabelle Mendes Sousa', 'bellemendessousa@gmail.com', '98987287572', 'ativo', 'interessado', '2008-03-17'::date, null::date, null::date, 'RUA 18 QD 27, 50, JARDIM ALVORADA, Maranhao', 'solteiro', 'feminino', null),
            ('Itapoan Santos Sousa', 'iturturismo@gmail.com', '98987401007', 'ativo', 'interessado', '1977-02-01'::date, null::date, null::date, 'RUA 18 QD 27 N, 50, JARDIM ALVORADA, Maranhao', 'casado', 'masculino', null),
            ('Jeilson Barbosa Silva', 'jeilson.barbosa+00005@noemail.cbnkerigma.local', null, 'ativo', 'interessado', null::date, null::date, null::date, 'Maranhao', 'solteiro', 'masculino', null),
            ('Jhoubertt Quintanilha', 'jhoubertt@hotmail.com', '98988070580', 'ativo', 'batizado', '1978-03-27'::date, '1999-07-05'::date, '1999-02-27'::date, 'Cond. Riviera Bl-02 , Estrada da Maioba, 208, Trizidela, Maranhao', 'casado', 'masculino', null),
            ('Jocksan Marcos Santos Costa', 'jocksan.marcos@gmail.com', '98981550474', 'ativo', 'batizado', '1971-12-24'::date, '1990-01-17'::date, null::date, 'Avenida Epitácio Cafeteira , 3, Maioba do Jenipapeiro , Maranhao', 'casado', 'masculino', null),
            ('Joel Mendes', 'jottatrial@gmail.com', '98987705749', 'ativo', 'interessado', '1980-01-31'::date, null::date, null::date, 'Rua 07, 54, Chatrac, Maranhao', 'casado', 'masculino', null),
            ('Josedna Dos Santos Passos', 'josednapassos@gmail.com', '98985344662', 'ativo', 'batizado', '1965-03-15'::date, '1990-02-01'::date, '1990-02-02'::date, 'Rua Val Divino Castelo Branco, 22, Aurora, Maranhao', null, 'feminino', null),
            ('Josiléa Gomes Medrado', 'josileagmedrado@hotmail.com', '984943455', 'ativo', 'batizado', '1987-03-16'::date, '2004-06-27'::date, '2004-04-02'::date, 'Rua 17, 31, Cohatrac IV, Maranhao', 'casado', 'feminino', null),
            ('José Manoel Carneiro', 'jose.manoel+00006@noemail.cbnkerigma.local', null, 'ativo', 'interessado', '1967-05-01'::date, null::date, null::date, 'Maranhao', 'casado', 'masculino', null),
            ('José Ribamar Palácio', 'jose.ribamar+00007@noemail.cbnkerigma.local', null, 'ativo', 'interessado', null::date, null::date, null::date, 'Maranhao', 'solteiro', 'masculino', null),
            ('João Manoel Veridiano', 'horlannebeatriz9@gmail.com', '98991861772', 'ativo', 'interessado', '2016-05-31'::date, null::date, null::date, 'Rua Santa Luzia, 50, Mata de Itapera, Maranhao', 'solteiro', 'masculino', null),
            ('JURANDY VIEGAS ALMEIDA', 'jurandy_viegas@hotmail.com', '98982025890', 'ativo', 'interessado', '1961-02-28'::date, null::date, null::date, 'UM, 25, Cohatrac III, Maranhao', 'solteiro', 'masculino', null),
            ('Karla Cristina Viegas Santos Mendes', 'karlaviegasmendes@gmail.com', '98985204437', 'ativo', 'interessado', '2025-06-25'::date, null::date, null::date, 'Rua 7; Quadra 14, 54, Cohatrac 3, Maranhao', 'casado', 'feminino', 'O Senhor é a minha Rocha!')
        ) AS t(nome_completo, email, telefone, situacao, estado_espiritual, data_nascimento, data_batismo, data_conversao, endereco, estado_civil, genero, observacoes)
    LOOP
        INSERT INTO pessoas (
            nome_completo, email, telefone, situacao, estado_espiritual,
            data_nascimento, data_batismo, data_conversao, endereco, 
            estado_civil, genero, tipo_pessoa, observacoes
        ) VALUES (
            pessoa_record.nome_completo,
            pessoa_record.email,
            pessoa_record.telefone,
            pessoa_record.situacao,
            pessoa_record.estado_espiritual,
            pessoa_record.data_nascimento,
            pessoa_record.data_batismo,
            pessoa_record.data_conversao,
            pessoa_record.endereco,
            pessoa_record.estado_civil,
            pessoa_record.genero,
            'membro',
            pessoa_record.observacoes
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
            observacoes = EXCLUDED.observacoes,
            updated_at = now();
    END LOOP;
END $$;