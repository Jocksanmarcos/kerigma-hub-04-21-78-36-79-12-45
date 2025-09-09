-- Adicionar campo genero na tabela pessoas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pessoas' AND column_name = 'genero'
  ) THEN
    ALTER TABLE public.pessoas ADD COLUMN genero text;
  END IF;
END $$;

-- Inserir os dados das pessoas
INSERT INTO public.pessoas (
  nome_completo, email, telefone, situacao, estado_espiritual, 
  data_nascimento, data_batismo, data_conversao, endereco, 
  estado_civil, genero, observacoes
) VALUES 
('Adeval Cordeiro', 'advmneto@gmail.com', '98981267938', 'ativo', null, '1979-03-24', null, null, 'Rua 20 Quadra 32, 9, Jardim Alvorada, Maranhao', 'casado', 'masculino', null),
('Agostinha Araújo Pereira', 'agostinhap@yahoo.com.br', '98981919202', 'ativo', 'convertido', '1954-03-24', null, '1987-09-12', 'Estrada de Ribamar, Km 2, 5, Aurora, Maranhao', 'casado', 'feminino', null),
('Alice Zacheu', 'alicepzacheu63@gmail.com', '98981573303', 'ativo', null, '1965-04-21', null, null, 'Rua 1, Quadra 1, Planalto Anil, 10, Aurora, Maranhao', 'casado', 'feminino', null),
('Ana Lara Passos', 'passosanalara8@gmail.com', '98991386416', 'ativo', 'batizado', '2011-10-08', '2024-06-30', '2024-01-11', 'Rua Val Divino Castelo Branco, 22, Aurora, Maranhao', 'solteiro', 'feminino', null),
('Antenor Barros', 'antenor.neto@ma.aluno.senai.br', '988159590', 'ativo', null, '1984-01-01', null, null, 'Rua 16 casa25 quadra 32, Cohatrac 3 , Maranhao', 'divorciado', 'masculino', null),
('Antonio José Santos Pastor', 'antoniopastor89@gmail.com', '98981637830', 'ativo', 'convertido', '1969-04-25', null, '1989-11-19', 'Avenida: 14, 3° Conjunto., 08, Co.Hab- Anil, Maranhao', 'casado', 'masculino', null),
('Antonio Marques da Silva Neto', 'missaodoreinoslz@gmail.com', '98981676441', 'ativo', null, '1963-06-25', null, null, 'R.Petronio Portela, 122, Forquilha, Maranhao', 'casado', 'masculino', null),
('Ariane Correa Castro', 'castroarianny17@gmail.com', '98984442340', 'ativo', null, '1998-12-02', null, null, 'Condomínio Vitória, 68, Estrada de Ribmar, Maranhao', 'solteiro', 'feminino', null),
('Athon Silva Silva', 'athomicopurification@gmail.com', null, 'inativo', null, '1968-01-08', null, null, 'Rua 48 Quadra 15 , 1a , Maio bão , Maranhao', 'solteiro', 'masculino', null),
('Benjamim Araujo Barros Araujo', 'benjamim.araujo@noemail.cbnkerigma.local', '98991754854', 'ativo', null, '1998-05-23', null, null, 'Rua 2 quadra 24, Casa 5, Jardim Sao Cristovão 2, Maranhao', 'solteiro', 'masculino', 'Nenhuma'),
('Carlos Santos Araújo Martins Santos', 'carm304050@gmail.com', '988146145', 'ativo', null, '1983-01-25', null, null, 'Av dos franceses, 38, Tirirical, Maranhao', 'solteiro', 'masculino', null),
('Catiane Santos Sousa', 'catianesousa29@gmail.com', '98981839426', 'ativo', 'batizado', '1976-02-29', '2002-07-22', '2002-01-01', 'Rua 18, 41, Jardim Alvorada, Maranhao', 'divorciado', 'feminino', null),
('cbnkerigma SEDE', 'contato@cbnkerigma.org.br', '5598981550474', 'ativo', null, '2008-08-20', null, null, 'Estrada de Ribamar, Km 2 , 5, Aurora , Maranhao', 'casado', 'feminino', null),
('Cipriano de Sousa Pereira', 'ciprianopereira@yahoo.com.br', '98982427015', 'ativo', null, '1955-09-17', null, null, 'Estrada de Ribamar, Km 2 , 5, Aurora, Maranhao', 'casado', 'masculino', null),
('Claudia Nascimento Santos', 'nascimentosantosclaudia@gmail.com', '98988380538', 'ativo', null, '1982-04-11', null, null, 'Maranhao', 'casado', 'feminino', null),
('Danielle Mendes Sousa', 'danny.belzinha@gmail.com', '98999746326', 'ativo', null, '1982-01-18', null, null, 'RUA 18 QD 27, 50, JARDIM ALVORADA, Maranhao', 'casado', 'feminino', null),
('Davi Santos da Silva', 'silva.davis2005@gmail.com', '98981781909', 'ativo', 'batizado', '2005-09-20', '2021-12-31', null, 'Rua B, Q 2, 25, Jardim turu, Maranhao', 'solteiro', 'masculino', null),
('Emanoel Matos', 'emcmatos@gmail.com', '98987247308', 'ativo', 'batizado', '1981-10-10', '2024-06-14', '2019-05-24', 'Maranhao', 'divorciado', 'masculino', null),
('Fernando Artur de Azevedo Silva', 'fernandorutra17@gmail.com', '98982606189', 'ativo', 'convertido', '2000-12-17', null, '2024-06-27', 'Rua A, Residencial Solar dos Encantos, 53, Forquilha, Maranhao', 'solteiro', 'masculino', 'Tem alergia a dipirona, ibuprofeno, cetoprofeno e diclofenaco. Tem enxaqueca, sinusite, distensão temporomandibular.'),
('Francisca Gomes', 'ft_gomes01@yahoo.com.br', '98988118669', 'ativo', null, '1967-10-03', null, null, 'Estrada de Ribamar Km 03,  Torre orre A1, Apto 104, SN, Forquilha, Maranhao', 'casado', 'feminino', null);

-- Continuar com o resto dos dados...
INSERT INTO public.pessoas (
  nome_completo, email, telefone, situacao, estado_espiritual, 
  data_nascimento, data_batismo, data_conversao, endereco, 
  estado_civil, genero, observacoes
) VALUES 
('Francisco de Assis Nunes Bezerra Nunes', 'francisco.nunes.solda@gmail.com', '98991861772', 'ativo', 'convertido', '1983-04-05', null, '2024-07-28', 'Rua santa luzia, 50, Mata de ITAPERA Maracanã, Maranhao', 'casado', 'masculino', null),
('GARDENIA CORREIA CARDOSO', 'gardeniacorreia0109@gmail.com', '98985125858', 'ativo', null, '1990-03-06', null, null, 'Rua São Jose, 07, Mata de Itapera, Maranhao', 'solteiro', 'feminino', null),
('Giesa Greisy Castro de Almeida', 'giesacastro13@gmail.com', '98982956022', 'ativo', 'batizado', '1987-10-13', '2024-12-06', '2017-12-01', 'ESTRADA DE RIBAMAR, 19, Maiobinha, Maranhao', 'casado', 'feminino', null),
('Gina Tainã Medeiros', 'ginataina@hotmail.com', '98988011863', 'ativo', 'convertido', '1990-02-21', null, '2013-05-29', 'Estrada de Ribamar km 2, 5F, Pingao, Maranhao', 'casado', 'feminino', null),
('Gracineide Fragoso da Silva', 'fragosoneide956@gmail.com', null, 'ativo', null, '1960-05-01', null, null, 'Maranhao', 'divorciado', 'feminino', null),
('Horlanne Beatriz', 'horlanneveridiano@gmail.com', null, 'ativo', null, null, null, null, 'Maranhao', 'solteiro', 'feminino', null),
('Isabel Cristina Pastor', 'crys.bel@hotmail.com', '98988752054', 'ativo', null, '1977-02-06', null, null, 'Cohab Anil 3, Maranhao', 'casado', 'feminino', null),
('Isabelle Mendes Sousa', 'bellemendessousa@gmail.com', '98987287572', 'ativo', null, '2008-03-17', null, null, 'RUA 18 QD 27, 50, JARDIM ALVORADA, Maranhao', 'solteiro', 'feminino', null),
('Itapoan Santos Sousa', 'iturturismo@gmail.com', '98987401007', 'ativo', null, '1977-02-01', null, null, 'RUA 18 QD 27 N, 50, JARDIM ALVORADA, Maranhao', 'casado', 'masculino', null),
('Jeilson Barbosa Silva', 'jeilson.silva@noemail.cbnkerigma.local', null, 'ativo', null, null, null, null, 'Maranhao', 'solteiro', 'masculino', null),
('Jhoubertt Quintanilha', 'jhoubertt@hotmail.com', '98988070580', 'ativo', 'batizado', '1978-03-27', '1999-07-05', '1999-02-27', 'Cond. Riviera Bl-02 , Estrada da Maioba, 208, Trizidela, Maranhao', 'casado', 'masculino', null),
('Jocksan Marcos Santos Costa', 'jocksan.marcos@gmail.com', '98981550474', 'ativo', 'batizado', '1971-12-24', '1990-01-17', null, 'Avenida Epitácio Cafeteira , 3, Maioba do Jenipapeiro , Maranhao', 'casado', 'masculino', null),
('Joel Mendes', 'jottatrial@gmail.com', '98987705749', 'ativo', null, '1980-01-31', null, null, 'Rua 07, 54, Chatrac, Maranhao', 'casado', 'masculino', null),
('Josedna Dos Santos Passos', 'josednapassos@gmail.com', '98985344662', 'ativo', 'batizado', '1965-03-15', '1990-02-01', '1990-02-02', 'Rua Val Divino Castelo Branco, 22, Aurora, Maranhao', null, 'feminino', null),
('Josiléa Gomes Medrado', 'josileagmedrado@hotmail.com', '984943455', 'ativo', 'batizado', '1987-03-16', '2004-06-27', '2004-04-02', 'Rua 17, 31, Cohatrac IV, Maranhao', 'casado', 'feminino', null),
('José Manoel Carneiro', 'jose.carneiro@noemail.cbnkerigma.local', null, 'ativo', null, '1967-05-01', null, null, 'Maranhao', 'casado', 'masculino', null),
('José Ribamar Palácio', 'jose.palacio@noemail.cbnkerigma.local', null, 'ativo', null, null, null, null, 'Maranhao', 'solteiro', 'masculino', null),
('João Manoel Veridiano', 'horlannebeatriz9@gmail.com', '98991861772', 'ativo', null, '2016-05-31', null, null, 'Rua Santa Luzia, 50, Mata de Itapera, Maranhao', 'solteiro', 'masculino', null),
('JURANDY VIEGAS ALMEIDA', 'jurandy_viegas@hotmail.com', '98982025890', 'ativo', null, '1961-02-28', null, null, 'UM, 25, Cohatrac III, Maranhao', 'solteiro', 'masculino', null),
('Karla Cristina Viegas Santos Mendes', 'karlaviegasmendes@gmail.com', '98985204437', 'ativo', null, '1995-06-25', null, null, 'Rua 7; Quadra 14, 54, Cohatrac 3, Maranhao', 'casado', 'feminino', 'O Senhor é a minha Rocha!');

-- Continuar com mais dados...
INSERT INTO public.pessoas (
  nome_completo, email, telefone, situacao, estado_espiritual, 
  data_nascimento, data_batismo, data_conversao, endereco, 
  estado_civil, genero, observacoes
) VALUES 
('Katicilene Bom Parto', 'katicilene.parto@noemail.cbnkerigma.local', null, 'ativo', null, null, null, null, 'Maranhao', 'solteiro', 'feminino', null),
('Kauê Marinho', 'kauepmarinho32@gmail.com', '98988972227', 'ativo', null, '2005-08-09', null, null, 'Av São Luís Rei de França, 1105, Turu, Maranhao', 'solteiro', 'masculino', null),
('Kecya Raissa Costa Serpa', 'raissa8528@gmail.com', '98985286481', 'ativo', 'batizado', '1993-08-18', '2015-08-01', null, 'Estrada de Ribamar km2, 5b, Aurora, Maranhao', 'solteiro', 'feminino', null),
('Klerton Sodré', 'klerton.sodre@noemail.cbnkerigma.local', '98982215364', 'ativo', 'batizado', '1976-11-22', '2007-08-10', null, 'Rua M Quadra 37 Casa, 17, Maranhao', 'casado', 'masculino', null),
('LUCIMARY Quintanilha', 'maryseduc77@gmail.com', '98984024270', 'ativo', null, '1977-04-01', null, null, 'Apartamento 208 BL, 01, Triziidela da maioba, Maranhao', 'casado', 'feminino', null),
('Lucinalva da Conceição Azevedo dos Santos', 'lucinalv@hotmail.com', '98988188398', 'ativo', null, '1968-02-14', null, null, 'Rua, 27, Cohatrac IV, Maranhao', 'solteiro', 'feminino', null),
('Marcia Regina Machado Lima Luz', 'marcia.luz@noemail.cbnkerigma.local', null, 'ativo', 'convertido', null, null, '2024-03-05', '98 98814-1963, Forquilha, Maranhao', 'casado', 'feminino', 'Cheguei na kerigma há 10 anos. Não me batizei lá. Não lembro a data,exata do batismo. 20 anos de convenção. Grupo familiar da aurora'),
('Marcia Regina Marcia', 'Marciaregina121212@gmail.com', '98988141963', 'ativo', null, '1974-11-03', null, null, 'Estrada de ribamar condomínio. Village do bosque 2, 03apt bloco7, Forquilha, Maranhao', 'casado', 'feminino', 'Faltou o data da convenção exata eo do batismo ok. Eo CPF do marido ok'),
('Maria Alice Mendes da Silva', 'mariaalice4785@icloud.com', '98984952892', 'ativo', null, '2003-08-30', null, null, '39, Mata de itapera, Maranhao', 'solteiro', 'feminino', null),
('Maria da Penha Cutrim Milen Penha', 'mariapenhamilen@gmail.com', '98991884617', 'ativo', null, '1985-09-13', null, null, 'Avenida Monção,  10, Torre Jade, Dubai,, Apartamento 1308, São Luís, Maranhao', null, 'feminino', null),
('Maria das dores Alves Brandão', 'maria.brandao@noemail.cbnkerigma.local', '98987415481', 'ativo', 'convertido', '1965-03-24', null, '2024-03-11', 'Rua 10 quadra 21 casa 38, 38, Cohatrac 3, Maranhao', 'divorciado', 'feminino', null),
('Maria Das Graças Santos Pereira', 'graca.cikt@gmail.com', '98981314080', 'ativo', null, '1955-05-22', null, null, '981314080, 98, Maranhao', 'divorciado', 'feminino', null),
('Maria Luciana Moraes dos Santos Santos', 'MariaLucianasantos12344@gmail.com', '81826942', 'ativo', 'convertido', '1981-05-28', null, '2023-05-28', 'Av.dos Franceses, 301, Outeiro da Cruz, Maranhao', 'casado', 'feminino', null),
('Mariane Nunes', 'aliancafestas@hotmail.com', '98988884985', 'ativo', null, '1967-08-26', null, null, 'Rua frei Hermenegildo , Casa 13 residencial Tábata , Aurora, Maranhao', 'divorciado', 'feminino', null),
('Mirelle Thaynara Araujo', 'mirelle_thaynara@hotmail.com', '98991628569', 'ativo', null, '1988-03-12', null, null, 'Rua 2 quadra 24, 05, Jardim Sao Cristovao, Maranhao', 'casado', 'feminino', null),
('Márcia Dutra de Sousa Dutra', 'marciadsgeo@hotmail.com', '989888561525', 'ativo', null, '1975-06-01', null, null, 'rua 05 quadra 10 casa, 031, Cohatrac III, Maranhao', 'divorciado', 'feminino', null),
('Mário Henrique Rodrigues', 'mario.rodrigues@noemail.cbnkerigma.local', null, 'ativo', null, '1976-05-22', null, null, 'Maranhao', 'casado', 'masculino', null),
('Nivaldo Mourão Rocha de Sousa Junior', 'nivaldo.sousa@noemail.cbnkerigma.local', '98989053309', 'ativo', 'batizado', '1987-12-20', '2024-12-15', '2020-03-20', 'Rua 16, 11, Lá belle park, Maranhao', 'casado', 'masculino', null),
('Pollyanna Vieira Silva Cordeiro', 'polly.cordeiro79@gmail.com', '98987414047', 'ativo', null, '1979-10-24', null, null, 'Rua 20, 09, Jardim Alvorada, Maranhao', 'casado', 'feminino', null),
('Priscilla Sousa da Costa', 'priscillakuka@gmail.com', '98991496801', 'ativo', 'batizado', '1987-07-28', '2013-11-28', '2013-03-15', 'Rua 16, 11, Lá belle park, Maranhao', 'casado', 'feminino', null);

-- Finalizar com o restante dos dados...
INSERT INTO public.pessoas (
  nome_completo, email, telefone, situacao, estado_espiritual, 
  data_nascimento, data_batismo, data_conversao, endereco, 
  estado_civil, genero, observacoes
) VALUES 
('Rafael Mendes Silva', 'rafaelmsilva917@gmail.com', '98985058452', 'ativo', null, '1993-01-09', null, null, 'Estrada de Ribamar/Condomínio Vitória, 68, Forquilha, Maranhao', 'casado', 'masculino', null),
('Rosileide dos Santos', 'Lobosrosileide@gmail.com', '98999344279', 'ativo', null, '1996-04-28', null, null, 'Rua Gardênia Ribeiro Gonçalves, 18, Parque Vitória, Maranhao', 'casado', 'feminino', null),
('Rosângela Palácio', 'rosangela.palacio@noemail.cbnkerigma.local', null, 'ativo', null, '1967-04-25', null, null, 'Maranhao', 'casado', 'feminino', null),
('Sandro Ferreira da Costa', 'terapeutasandrocosta@gmail.com', '98984221313', 'ativo', 'batizado', '1971-05-15', '1988-11-15', '1987-11-25', 'Conjunto Planalto Pingão, 9, Aurora, Maranhao', 'casado', 'masculino', null),
('Saul Silva de Melo', 'silvasaul@ymail.com', '98970268668', 'ativo', null, '1976-06-07', null, null, 'Estrada de Ribamar , 43, Planalto Aurora, Maranhao', 'casado', 'masculino', null),
('Silvia Dileli Costa', 'silvia.dileli@icloud.com', '9898834410', 'ativo', null, '1964-06-06', null, null, 'Avenida Epitácio Cafeteria, 3, Maioba do Jenipapeiro, Maranhao', 'casado', 'feminino', null),
('Sonia Maria Marinho', 'sonia.marinho@noemail.cbnkerigma.local', null, 'ativo', null, null, null, null, 'Maranhao', null, 'feminino', null),
('Valdilene Nunes', 'valdilene.nunes@noemail.cbnkerigma.local', null, 'ativo', null, null, null, null, 'Maranhao', 'solteiro', 'feminino', null),
('Vitória Santos', 'vitoria960289@gmail.com', '98984691024', 'ativo', null, '2005-07-23', null, null, 'loteamento jardim turu, rua b, qdr 2, n 24, 24, loteamento jardim turu, Maranhao', 'solteiro', 'feminino', null),
('Wannthyla Correa Castro Silva', 'wannthylacorrea@gmail.com', '98992226558', 'ativo', null, '1995-10-17', null, null, 'Estrada de Ribamar/ Condomínio Vitória, 68, Forquilha, Maranhao', 'casado', 'feminino', null),
('Wellyssu Rudson', 'ar.130rudson@gmail.com', '98981008034', 'ativo', null, '1993-08-07', null, null, 'Rua 1600, 25A, Parque Aurora Cohatrac , Maranhao', 'solteiro', 'masculino', null),
('Wendel Costa Leite Medrado', 'wendelmedrado@hotmail.com', '98981133030', 'ativo', null, '1976-10-10', null, null, 'Rua 17, 31, Cohatrac IV, Maranhao', 'casado', 'masculino', null),
('Wilton Lindoso Barros', 'wlb_barros@hotmail.com', '98986288910', 'ativo', 'batizado', '1976-08-27', '2015-04-05', '2014-12-09', 'Rua 02 qd 24, 05, Jardim São Cristóvão 2, Maranhao', 'casado', 'masculino', null),
('Yasmin Brandão Marinho', 'yasmin.marinho@noemail.cbnkerigma.local', '98989072119', 'ativo', null, null, null, null, 'Moove Residence, avenida Rei de Franca, Turu, Maranhao', 'solteiro', 'feminino', null),
('Érica Carneiro', 'erica.carneiro@noemail.cbnkerigma.local', null, 'ativo', null, null, null, null, 'Maranhao', 'solteiro', 'feminino', null)
ON CONFLICT (email) DO NOTHING;