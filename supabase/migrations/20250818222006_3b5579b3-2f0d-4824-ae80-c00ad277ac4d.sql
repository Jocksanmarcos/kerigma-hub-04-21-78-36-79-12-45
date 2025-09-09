-- Insert people data into the pessoas table
INSERT INTO public.pessoas (
  nome_completo, email, telefone, situacao, estado_espiritual, 
  data_nascimento, data_batismo, data_conversao, endereco, 
  estado_civil, observacoes, tipo_pessoa
) VALUES 
('Adeval Cordeiro', 'advmneto@gmail.com', '98981267938', 'ativo', null, '1979-03-24', null, null, 'Rua 20 Quadra 32, 9, Jardim Alvorada, Maranhao', 'casado', null, 'membro'),
('Agostinha Araújo Pereira', 'agostinhap@yahoo.com.br', '98981919202', 'ativo', 'convertido', '1954-03-24', null, '1987-09-12', 'Estrada de Ribamar, Km 2, 5, Aurora, Maranhao', 'casado', null, 'membro'),
('Alice Zacheu', 'alicepzacheu63@gmail.com', '98981573303', 'ativo', null, '1965-04-21', null, null, 'Rua 1, Quadra 1, Planalto Anil, 10, Aurora, Maranhao', 'casado', null, 'membro'),
('Ana Lara Passos', 'passosanalara8@gmail.com', '98991386416', 'ativo', 'batizado', '2011-10-08', '2024-06-30', '2024-01-11', 'Rua Val Divino Castelo Branco, 22, Aurora, Maranhao', 'solteiro', null, 'membro'),
('Antenor Barros', 'antenor.neto@ma.aluno.senai.br', '988159590', 'ativo', null, '1984-01-01', null, null, 'Rua 16 casa25 quadra 32, Cohatrac 3 , Maranhao', 'divorciado', null, 'membro'),
('Antonio José Santos Pastor', 'antoniopastor89@gmail.com', '98981637830', 'ativo', 'convertido', '1969-04-25', null, '1989-11-19', 'Avenida: 14, 3° Conjunto., 08, Co.Hab- Anil, Maranhao', 'casado', null, 'membro'),
('Antonio Marques da Silva Neto', 'missaodoreinoslz@gmail.com', '98981676441', 'ativo', null, '1990-06-25', null, null, 'R.Petronio Portela, 122, Forquilha, Maranhao', 'casado', null, 'membro'),
('Ariane Correa Castro', 'castroarianny17@gmail.com', '98984442340', 'ativo', null, '1998-12-02', null, null, 'Condomínio Vitória, 68, Estrada de Ribmar, Maranhao', 'solteiro', null, 'membro'),
('Athon Silva Silva', 'athomicopurification@gmail.com', null, 'inativo', null, '1968-01-08', null, null, 'Rua 48 Quadra 15 , 1a , Maio bão , Maranhao', 'solteiro', null, 'membro'),
('Benjamim Araujo Barros Araujo', 'benjamim+no-email@cbnkerigma.local', '98991754854', 'ativo', null, '1998-05-23', null, null, 'Rua 2 quadra 24, Casa 5, Jardim Sao Cristovão 2, Maranhao', 'solteiro', 'Nenhuma', 'membro'),
('Carlos Santos Araújo Martins Santos', 'carm304050@gmail.com', '988146145', 'ativo', null, '1983-01-25', null, null, 'Av dos franceses, 38, Tirirical, Maranhao', 'solteiro', null, 'membro'),
('Catiane Santos Sousa', 'catianesousa29@gmail.com', '98981839426', 'ativo', 'batizado', '1976-02-29', '2002-07-22', '2002-01-01', 'Rua 18, 41, Jardim Alvorada, Maranhao', 'divorciado', null, 'membro'),
('cbnkerigma SEDE', 'contato@cbnkerigma.org.br', '5598981550474', 'ativo', null, '2008-08-20', null, null, 'Estrada de Ribamar, Km 2 , 5, Aurora , Maranhao', 'casado', null, 'membro'),
('Cipriano de Sousa Pereira', 'ciprianopereira@yahoo.com.br', '98982427015', 'ativo', null, '1955-09-17', null, null, 'Estrada de Ribamar, Km 2 , 5, Aurora, Maranhao', 'casado', null, 'membro'),
('Claudia Nascimento Santos', 'nascimentosantosclaudia@gmail.com', '98988380538', 'ativo', null, '1982-04-11', null, null, 'Maranhao', 'casado', null, 'membro'),
('Danielle Mendes Sousa', 'danny.belzinha@gmail.com', '98999746326', 'ativo', null, '1982-01-18', null, null, 'RUA 18 QD 27, 50, JARDIM ALVORADA, Maranhao', 'casado', null, 'membro'),
('Davi Santos da Silva', 'silva.davis2005@gmail.com', '98981781909', 'ativo', 'batizado', '2005-09-20', '2021-12-31', null, 'Rua B, Q 2, 25, Jardim turu, Maranhao', 'solteiro', null, 'membro'),
('Emanoel Matos', 'emcmatos@gmail.com', '98987247308', 'ativo', 'batizado', '1981-10-10', '2024-06-14', '2019-05-24', 'Maranhao', 'divorciado', null, 'membro'),
('Fernando Artur de Azevedo Silva', 'fernandorutra17@gmail.com', '98982606189', 'ativo', 'convertido', '1999-12-17', null, '2024-06-27', 'Rua A, Residencial Solar dos Encantos, 53, Forquilha, Maranhao', 'solteiro', 'Tem alergia a dipirona, ibuprofeno, cetoprofeno e diclofenaco. Tem enxaqueca, sinusite, distensão temporomandibular.', 'membro'),
('Francisca Gomes', 'ft_gomes01@yahoo.com.br', '98988118669', 'ativo', null, '1967-10-03', null, null, 'Estrada de Ribamar Km 03,  Torre orre A1, Apto 104, SN, Forquilha, Maranhao', 'casado', null, 'membro')
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
  observacoes = EXCLUDED.observacoes,
  updated_at = now();