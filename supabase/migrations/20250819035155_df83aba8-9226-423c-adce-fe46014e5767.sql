-- Import remaining data set
DO $$
DECLARE
    pessoa_record record;
BEGIN
    -- Continue with more data...
    FOR pessoa_record IN 
        SELECT * FROM (VALUES
            ('Katicilene Bom Parto', 'katicilene.bom+00008@noemail.cbnkerigma.local', null, 'ativo', 'interessado', null::date, null::date, null::date, 'Maranhao', 'solteiro', 'feminino', null),
            ('Kauê Marinho', 'kauepmarinho32@gmail.com', '98988972227', 'ativo', 'interessado', '2005-08-09'::date, null::date, null::date, 'Av São Luís Rei de França, 1105, Turu, Maranhao', 'solteiro', 'masculino', null),
            ('Kecya Raissa Costa Serpa', 'raissa8528@gmail.com', '98985286481', 'ativo', 'batizado', '1993-08-18'::date, '2015-08-01'::date, null::date, 'Estrada de Ribamar km2, 5b, Aurora, Maranhao', 'solteiro', 'feminino', null),
            ('Klerton Sodré', 'klerton.sodre+00009@noemail.cbnkerigma.local', '98982215364', 'ativo', 'batizado', '1976-11-22'::date, '2007-08-10'::date, null::date, 'Rua M Quadra 37 Casa, 17, Maranhao', 'casado', 'masculino', null),
            ('LUCIMARY Quintanilha', 'maryseduc77@gmail.com', '98984024270', 'ativo', 'interessado', '2025-04-01'::date, null::date, null::date, 'Apartamento 208 BL, 01, Triziidela da maioba, Maranhao', 'casado', 'feminino', null),
            ('Lucinalva da Conceição Azevedo dos Santos', 'lucinalv@hotmail.com', '98988188398', 'ativo', 'interessado', '1968-02-14'::date, null::date, null::date, 'Rua, 27, Cohatrac IV, Maranhao', 'solteiro', 'masculino', null),
            ('Marcia Regina Machado Lima Luz', 'marcia.regina+00010@noemail.cbnkerigma.local', null, 'ativo', 'convertido', null::date, null::date, '2025-03-05'::date, '98 98814-1963, Forquilha, Maranhao', 'casado', 'feminino', 'Cheguei na kerigma há 10 anos \nNão me batizei lá\nNão lembro a data,exata do batismo \n20 anos de convenção \nGrupo familiar da aurora'),
            ('Marcia Regina Marcia', 'Marciaregina121212@gmail.com', '98988141963', 'ativo', 'interessado', '1974-11-03'::date, null::date, null::date, 'Estrada de ribamar condomínio. Village do bosque 2, 03apt bloco7, Forquilha, Maranhao', 'casado', 'feminino', 'Faltou o data da convenção exata eo do batismo ok\nEo CPF do marido ok'),
            ('Maria Alice Mendes da Silva', 'mariaalice4785@icloud.com', '98984952892', 'ativo', 'interessado', '2003-08-30'::date, null::date, null::date, '39, Mata de itapera, Maranhao', 'solteiro', 'feminino', null),
            ('Maria da Penha Cutrim Milen Penha', 'mariapenhamilen@gmail.com', '98991884617', 'ativo', 'interessado', '2025-09-13'::date, null::date, null::date, 'Avenida Monção,  10, Torre Jade, Dubai,, Apartamento 1308, São Luís, Maranhao', null, 'feminino', null),
            ('Maria das dores Alves Brandão', 'maria.dores+00011@noemail.cbnkerigma.local', '98987415481', 'ativo', 'convertido', '2025-03-24'::date, null::date, '2025-03-11'::date, 'Rua 10 quadra 21 casa 38, 38, Cohatrac 3, Maranhao', 'divorciado', 'feminino', null),
            ('Maria Das Graças Santos Pereira', 'graca.cikt@gmail.com', '98981314080', 'ativo', 'interessado', '1955-05-22'::date, null::date, null::date, '981314080, 98, Maranhao', 'divorciado', 'feminino', null),
            ('Maria Luciana Moraes dos Santos Santos', 'MariaLucianasantos12344@gmail.com', '81826942', 'ativo', 'convertido', '1981-05-28'::date, null::date, '2023-05-28'::date, 'Av.dos Franceses, 301, Outeiro da Cruz, Maranhao', 'casado', 'feminino', null),
            ('Mariane Nunes', 'aliancafestas@hotmail.com', '98988884985', 'ativo', 'interessado', '1967-08-26'::date, null::date, null::date, 'Rua frei Hermenegildo , Casa 13 residencial Tábata , Aurora, Maranhao', 'divorciado', 'feminino', null),
            ('Mirelle Thaynara Araujo', 'mirelle_thaynara@hotmail.com', '98991628569', 'ativo', 'interessado', '1988-03-12'::date, null::date, null::date, 'Rua 2 quadra 24, 05, Jardim Sao Cristovao, Maranhao', 'casado', 'masculino', null),
            ('Márcia Dutra de Sousa Dutra', 'marciadsgeo@hotmail.com', '989888561525', 'ativo', 'interessado', '2025-06-01'::date, null::date, null::date, 'rua 05 quadra 10 casa, 031, Cohatrac III, Maranhao', 'divorciado', 'feminino', null),
            ('Mário Henrique Rodrigues', 'mario.henrique+00012@noemail.cbnkerigma.local', null, 'ativo', 'interessado', '1976-05-22'::date, null::date, null::date, 'Maranhao', 'casado', 'masculino', null),
            ('Nivaldo Mourão Rocha de Sousa Junior', 'nivaldo.mourao+00013@noemail.cbnkerigma.local', '98989053309', 'ativo', 'batizado', '1987-12-20'::date, '2024-12-15'::date, '2020-03-20'::date, 'Rua 16, 11, Lá belle park, Maranhao', 'casado', 'masculino', null),
            ('Pollyanna Vieira Silva Cordeiro', 'polly.cordeiro79@gmail.com', '98987414047', 'ativo', 'interessado', '1979-10-24'::date, null::date, null::date, 'Rua 20, 09, Jardim Alvorada, Maranhao', 'casado', 'feminino', null),
            ('Priscilla Sousa da Costa', 'priscillakuka@gmail.com', '98991496801', 'ativo', 'batizado', '1987-07-28'::date, '2013-11-28'::date, '2013-03-15'::date, 'Rua 16, 11, Lá belle park, Maranhao', 'casado', 'feminino', null),
            ('Rafael Mendes Silva', 'rafaelmsilva917@gmail.com', '98985058452', 'ativo', 'interessado', '1993-01-09'::date, null::date, null::date, 'Estrada de Ribamar/Condomínio Vitória, 68, Forquilha, Maranhao', 'casado', 'masculino', null),
            ('Rosileide dos Santos', 'Lobosrosileide@gmail.com', '98999344279', 'ativo', 'interessado', '1996-04-28'::date, null::date, null::date, 'Rua Gardênia Ribeiro Gonçalves, 18, Parque Vitória, Maranhao', 'casado', 'feminino', null),
            ('Rosângela Palácio', 'rosangela.palacio+00014@noemail.cbnkerigma.local', null, 'ativo', 'interessado', '1967-04-25'::date, null::date, null::date, 'Maranhao', 'casado', 'masculino', null),
            ('Sandro Ferreira da Costa', 'terapeutasandrocosta@gmail.com', '98984221313', 'ativo', 'batizado', '1971-05-15'::date, '1988-11-15'::date, '1987-11-25'::date, 'Conjunto Planalto Pingão, 9, Aurora, Maranhao', 'casado', 'masculino', null),
            ('Saul Silva de Melo', 'silvasaul@ymail.com', '98970268668', 'ativo', 'interessado', '1976-06-07'::date, null::date, null::date, 'Estrada de Ribamar , 43, Planalto Aurora, Maranhao', 'casado', 'masculino', null),
            ('Silvia Dileli Costa', 'silvia.dileli@icloud.com', '9898834410', 'ativo', 'interessado', '1964-06-06'::date, null::date, null::date, 'Avenida Epitácio Cafeteria, 3, Maioba do Jenipapeiro, Maranhao', 'casado', 'feminino', null),
            ('Sonia Maria Marinho', 'sonia.maria+00015@noemail.cbnkerigma.local', null, 'ativo', 'interessado', null::date, null::date, null::date, 'Maranhao', null, 'feminino', null),
            ('Valdilene Nunes', 'valdilene.nunes+00016@noemail.cbnkerigma.local', null, 'ativo', 'interessado', null::date, null::date, null::date, 'Maranhao', 'solteiro', 'masculino', null),
            ('Vitória Santos', 'vitoria960289@gmail.com', '98984691024', 'ativo', 'interessado', '2005-07-23'::date, null::date, null::date, 'loteamento jardim turu, rua b, qdr 2, n 24, 24, loteamento jardim turu, Maranhao', 'solteiro', 'feminino', null),
            ('Wannthyla Correa Castro Silva', 'wannthylacorrea@gmail.com', '98992226558', 'ativo', 'interessado', '1995-10-17'::date, null::date, null::date, 'Estrada de Ribamar/ Condomínio Vitória, 68, Forquilha, Maranhao', 'casado', 'feminino', null),
            ('Wellyssu Rudson', 'ar.130rudson@gmail.com', '98981008034', 'ativo', 'interessado', '1993-08-07'::date, null::date, null::date, 'Rua 1600, 25A, Parque Aurora Cohatrac , Maranhao', 'solteiro', 'masculino', null),
            ('Wendel Costa Leite Medrado', 'wendelmedrado@hotmail.com', '98981133030', 'ativo', 'interessado', '1976-10-10'::date, null::date, null::date, 'Rua 17, 31, Cohatrac IV, Maranhao', 'casado', 'masculino', null),
            ('Wilton Lindoso Barros', 'wlb_barros@hotmail.com', '98986288910', 'ativo', 'batizado', '1976-08-27'::date, '2015-04-05'::date, '2014-12-09'::date, 'Rua 02 qd 24, 05, Jardim São Cristóvão 2, Maranhao', 'casado', 'masculino', null),
            ('Yasmin Brandão Marinho', 'yasmin.brandao+00017@noemail.cbnkerigma.local', '98989072119', 'ativo', 'interessado', null::date, null::date, null::date, 'Moove Residence, avenida Rei de Franca, Turu, Maranhao', 'solteiro', 'masculino', null),
            ('Érica Carneiro', 'erica.carneiro+00018@noemail.cbnkerigma.local', null, 'ativo', 'interessado', null::date, null::date, null::date, 'Maranhao', 'solteiro', 'masculino', null)
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