-- Migration: tabela de codigos de tributacao nacional (cTribNac) baseada na LC 116/2003
-- Execute apos 006_create_menu_nfse_servicos.sql

CREATE TABLE IF NOT EXISTS nfse_ctribnac (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grupo        VARCHAR(10)  NOT NULL,           -- ex: '01'
  codigo       VARCHAR(10)  NOT NULL UNIQUE,     -- ex: '010101'
  descricao    TEXT         NOT NULL,
  grupo_desc   VARCHAR(255) NOT NULL,            -- descricao do grupo
  ativo        BOOLEAN      NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfse_ctribnac_codigo    ON nfse_ctribnac(codigo);
CREATE INDEX IF NOT EXISTS idx_nfse_ctribnac_grupo     ON nfse_ctribnac(grupo);
CREATE INDEX IF NOT EXISTS idx_nfse_ctribnac_descricao ON nfse_ctribnac USING gin(to_tsvector('portuguese', descricao));

ALTER TABLE nfse_ctribnac DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- Seed: principais codigos da Lista de Servicos (LC 116/2003)
-- ─────────────────────────────────────────────────────────────
INSERT INTO nfse_ctribnac (grupo, codigo, descricao, grupo_desc) VALUES
-- 01 – Informatica
('01','010101','Analise e desenvolvimento de sistemas','Servicos de informatica e congeneres'),
('01','010201','Programacao','Servicos de informatica e congeneres'),
('01','010301','Processamento de dados, textos, imagens, videos, paginas eletronicas e congeneres','Servicos de informatica e congeneres'),
('01','010302','Armazenamento ou hospedagem de dados, textos, imagens e congeneres (cloud)','Servicos de informatica e congeneres'),
('01','010401','Elaboracao de programas de computador, inclusive de jogos eletronicos','Servicos de informatica e congeneres'),
('01','010501','Licenciamento ou cessao de direito de uso de programas de computacao','Servicos de informatica e congeneres'),
('01','010601','Assessoria e consultoria em informatica','Servicos de informatica e congeneres'),
('01','010701','Suporte tecnico em informatica, inclusive instalacao, configuracao e manutencao de programas','Servicos de informatica e congeneres'),
('01','010801','Planejamento, confeccao, manutencao e atualizacao de paginas eletronicas','Servicos de informatica e congeneres'),

-- 02 – Pesquisas e desenvolvimento
('02','020101','Pesquisas e desenvolvimento de qualquer natureza','Pesquisas e desenvolvimento de qualquer natureza'),

-- 03 – Locacao, cessao de direito
('03','030101','Cessao de direito de uso de marcas e de sinais de propaganda','Servicos prestados mediante locacao, cessao de direito de uso e congeneres'),
('03','030201','Exploracao de saloes de festas, centro de convencoes, escritorios virtuais, stands, quadras esportivas, estadios, ginasios, auditorio, casas de espetaculos, parques de diversoes, canchas e congeneres','Servicos prestados mediante locacao, cessao de direito de uso e congeneres'),
('03','030301','Locacao, sublocacao, arrendamento, direito de passagem ou permissao de uso, compartilhado ou nao, de ferrovia, rodovia, postes, cabos, dutos e condutos de qualquer natureza','Servicos prestados mediante locacao, cessao de direito de uso e congeneres'),
('03','030302','Cessao de andaimes, palcos, coberturas e outras estruturas de uso temporario','Servicos prestados mediante locacao, cessao de direito de uso e congeneres'),

-- 04 – Saude
('04','040101','Medicina e biomedicina','Servicos de saude, assistencia medica e congeneres'),
('04','040201','Analises clinicas, patologia, eletricidade medica, radioterapia, quimioterapia, ultrassonografia, ressonancia magnetica, radiologia, tomografia e congeneres','Servicos de saude, assistencia medica e congeneres'),
('04','040301','Hospitais, clinicas, laboratorios, sanatorios, manicomios, casas de saude, prontos-socorros, ambulatorios e congeneres','Servicos de saude, assistencia medica e congeneres'),
('04','040401','Instrumentacao cirurgica','Servicos de saude, assistencia medica e congeneres'),
('04','040501','Acupuntura','Servicos de saude, assistencia medica e congeneres'),
('04','040601','Enfermagem, inclusive servicos auxiliares','Servicos de saude, assistencia medica e congeneres'),
('04','040701','Servicos farmaceuticos','Servicos de saude, assistencia medica e congeneres'),
('04','040801','Terapia ocupacional, fisioterapia e fonoaudiologia','Servicos de saude, assistencia medica e congeneres'),
('04','040901','Terapias de qualquer especie destinadas ao tratamento fisico, organico e mental','Servicos de saude, assistencia medica e congeneres'),
('04','041001','Nutricao','Servicos de saude, assistencia medica e congeneres'),
('04','041101','Obstetricia','Servicos de saude, assistencia medica e congeneres'),
('04','041201','Odontologia','Servicos de saude, assistencia medica e congeneres'),
('04','041301','Ortoptica','Servicos de saude, assistencia medica e congeneres'),
('04','041401','Proteses sob encomenda','Servicos de saude, assistencia medica e congeneres'),
('04','041501','Psicanálise','Servicos de saude, assistencia medica e congeneres'),
('04','041601','Psicologia','Servicos de saude, assistencia medica e congeneres'),
('04','041701','Casas de repouso e de recuperacao, creches, asilos e congeneres','Servicos de saude, assistencia medica e congeneres'),
('04','041801','Inseminacao artificial, fertilizacao in vitro e congeneres','Servicos de saude, assistencia medica e congeneres'),
('04','041901','Bancos de sangue, leite, pele, olhos, ovulos, semen e congeneres','Servicos de saude, assistencia medica e congeneres'),
('04','042001','Coleta de sangue, leite, tecidos, semen, orgaos e materiais biologicos de qualquer especie','Servicos de saude, assistencia medica e congeneres'),
('04','042101','Unidade de atendimento, assistencia ou tratamento movel e congeneres','Servicos de saude, assistencia medica e congeneres'),
('04','042201','Planos de medicina de grupo ou individual e convenios para prestacao de assistencia medica','Servicos de saude, assistencia medica e congeneres'),
('04','042301','Outros planos de saude que se cumpram atraves de servicos de terceiros','Servicos de saude, assistencia medica e congeneres'),

-- 05 – Medicina veterinaria
('05','050101','Medicina veterinaria e zootecnia','Servicos de medicina e assistencia veterinaria e congeneres'),

-- 06 – Cuidados pessoais
('06','060101','Barbearia, cabeleireiros, manicuros, pedicuros e congeneres','Servicos de cuidados pessoais, estetica e atividades fisicas'),
('06','060201','Esteticistas, tratamento de pele, depilacao e congeneres','Servicos de cuidados pessoais, estetica e atividades fisicas'),
('06','060301','Banhos, duchas, sauna, massagens e congeneres','Servicos de cuidados pessoais, estetica e atividades fisicas'),
('06','060401','Ginastica, danca, esportes, natacao, artes marciais e demais atividades fisicas','Servicos de cuidados pessoais, estetica e atividades fisicas'),
('06','060501','Centros de emagrecimento, spa e congeneres','Servicos de cuidados pessoais, estetica e atividades fisicas'),

-- 07 – Engenharia
('07','070101','Engenharia, agronomia, agrimensura, arquitetura, geologia, urbanismo, paisagismo e congeneres','Servicos relativos a engenharia, arquitetura, geologia, urbanismo, construcao civil, manutencao, limpeza, meio ambiente, saneamento e congeneres'),
('07','070201','Execucao, por administracao, empreitada ou subempreitada, de obras de construcao civil, hidraulica ou eletrica e de outras obras semelhantes, inclusive sondagem, perfuracao de pocos, escavacao, drenagem e irrigacao, terraplanagem, pavimentacao, concretagem e a instalacao e montagem de produtos, pecas e equipamentos (exceto o fornecimento de mercadorias produzidas pelo prestador de servicos fora do local da prestacao dos servicos, que fica sujeito ao ICMS)','Servicos relativos a engenharia, arquitetura, geologia, urbanismo, construcao civil, manutencao, limpeza, meio ambiente, saneamento e congeneres'),
('07','070301','Elaboracao de planos diretores, estudos de viabilidade, estudos organizacionais e outros, relacionados com obras e servicos de engenharia; elaboracao de anteprojetos, projetos basicos e projetos executivos para trabalhos de engenharia','Servicos relativos a engenharia, arquitetura, geologia, urbanismo, construcao civil, manutencao, limpeza, meio ambiente, saneamento e congeneres'),
('07','070401','Demolição','Servicos relativos a engenharia, arquitetura, geologia, urbanismo, construcao civil, manutencao, limpeza, meio ambiente, saneamento e congeneres'),
('07','070501','Reparacao, conservacao e reforma de edificios, estradas, pontes, portos e congeneres (exceto o fornecimento de mercadorias produzidas pelo prestador dos servicos, fora do local da prestacao dos servicos, que fica sujeito ao ICMS)','Servicos relativos a engenharia, arquitetura, geologia, urbanismo, construcao civil, manutencao, limpeza, meio ambiente, saneamento e congeneres'),

-- 08 – Educacao
('08','080101','Ensino regular pre-escolar, fundamental, medio e superior','Servicos de educacao, ensino, orientacao pedagogica e educacional, instrucao, treinamento e avaliacao pessoal de qualquer grau ou natureza'),
('08','080201','Instrucao, treinamento, orientacao pedagogica e educacional, avaliacao de conhecimentos de qualquer natureza','Servicos de educacao, ensino, orientacao pedagogica e educacional, instrucao, treinamento e avaliacao pessoal de qualquer grau ou natureza'),

-- 09 – Hospedagem e turismo
('09','090101','Hospedagem em hoteis, hotelaria maritima e congeneres (o valor da alimentacao e gorjeta, quando incluido no preco da diaria, fica sujeito ao ISS)','Servicos relativos a hospedagem, turismo, viagens e congeneres'),
('09','090201','Agenciamento, organizacao, promocao, intermediacao e execucao de programas de turismo, passeios, viagens, excursoes, hospedagens e congeneres','Servicos relativos a hospedagem, turismo, viagens e congeneres'),
('09','090301','Guias de turismo','Servicos relativos a hospedagem, turismo, viagens e congeneres'),

-- 10 – Intermediacao e representacao
('10','100101','Agenciamento, corretagem ou intermediacao de cambio, de seguros, de cartoes de credito, de planos de saude e de planos de previdencia privada','Servicos de intermediacao e congeneres'),
('10','100201','Agenciamento, corretagem ou intermediacao de titulos em geral, valores mobiliarios e contratos quaisquer','Servicos de intermediacao e congeneres'),
('10','100301','Agenciamento, corretagem ou intermediacao de direitos de propriedade industrial, artisticos ou conexos','Servicos de intermediacao e congeneres'),
('10','100401','Agenciamento, corretagem ou intermediacao de contratos de arrendamento mercantil (leasing), de franquia (franchising) e de faturizacao (factoring)','Servicos de intermediacao e congeneres'),
('10','100501','Agenciamento, corretagem ou intermediacao de bens moveis ou imoveis, nao abrangidos em outros itens ou subitens, inclusive aqueles realizados no ambito de Bolsas de Mercadorias e Futuros, por quaisquer meios','Servicos de intermediacao e congeneres'),
('10','100601','Agenciamento maritimo','Servicos de intermediacao e congeneres'),
('10','100701','Agenciamento de noticiarios, periodicos, publicacoes, informacoes e congeneres','Servicos de intermediacao e congeneres'),
('10','100801','Agenciamento de publicidade e propaganda, inclusive o agenciamento de veiculacao por quaisquer meios','Servicos de intermediacao e congeneres'),
('10','100901','Representacao de qualquer natureza, inclusive comercial','Servicos de intermediacao e congeneres'),
('10','101001','Distribuicao de bens de terceiros','Servicos de intermediacao e congeneres'),

-- 11 – Guarda e estacionamento
('11','110101','Guarda e estacionamento de veiculos terrestres automotores, de aeronaves e de embarcacoes','Servicos de guarda, estacionamento, armazenamento, vigilancia e congeneres'),
('11','110201','Vigilancia, seguranca ou monitoramento de bens e pessoas','Servicos de guarda, estacionamento, armazenamento, vigilancia e congeneres'),
('11','110301','Escolta, inclusive de veiculos e cargas','Servicos de guarda, estacionamento, armazenamento, vigilancia e congeneres'),
('11','110401','Armazenamento, deposito, carga, descarga, arrumacao e guarda de bens de qualquer especie','Servicos de guarda, estacionamento, armazenamento, vigilancia e congeneres'),

-- 12 – Diversoes publicas
('12','120101','Espetaculos teatrais','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','120201','Exibicoes cinematograficas','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','120301','Espetaculos circenses','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','120401','Programas de auditorio','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','120501','Parques de diversoes, centros de lazer e congeneres','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','120601','Boates, taxi-dancing e congeneres','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','120701','Shows, ballet, danças, desfiles, bailes, operas, concertos, recitais, festivais e congeneres','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','120801','Feiras, exposicoes, congressos e congeneres','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','120901','Bilhares, boliches e congeneres','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','121001','Corridas e competicoes de animais','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','121101','Competicoes esportivas ou de destreza fisica ou intelectual, com ou sem a participacao do espectador','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','121201','Execucao de musica','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','121301','Producao, mediante ou sem encomenda previa, de eventos, espetaculos, entrevistas, shows, ballet, danças, desfiles, bailes, teatros, operas, concertos, recitais, festivais e congeneres','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','121401','Fornecimento de musica para ambientes fechados ou abertos, por qualquer processo','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','121501','Desfiles de blocos carnavalescos ou folcloricos, trios eletricos e congeneres','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','121601','Exibicao de filmes, entrevistas, musicais, espetaculos, shows, concertos, desfiles, operas, competicoes esportivas, de destreza intelectual ou congeneres','Servicos de diversoes, lazer, entretenimento e congeneres'),
('12','121701','Recreacao e animacao, inclusive em festas e eventos de qualquer natureza','Servicos de diversoes, lazer, entretenimento e congeneres'),

-- 13 – Fonografia, fotografia
('13','130101','Fotografia e cinematografia, inclusive revelacao, ampliacao, copiagem, reproducao, trucagem e congeneres','Servicos relativos a fonografia, fotografia, cinematografia e reprografia'),
('13','130201','Filmagem de festas e eventos','Servicos relativos a fonografia, fotografia, cinematografia e reprografia'),
('13','130301','Fonografia ou gravacao de sons, inclusive trucagem, dublagem, mixagem e congeneres','Servicos relativos a fonografia, fotografia, cinematografia e reprografia'),
('13','130401','Reproducao de som e imagem por qualquer processo, para terceiros','Servicos relativos a fonografia, fotografia, cinematografia e reprografia'),
('13','130501','Reprografia, microfilmagem e digitalizacao','Servicos relativos a fonografia, fotografia, cinematografia e reprografia'),
('13','130601','Composicao grafica, fotocomposicao, clicheria, zincografia, litografia, fotolitografia','Servicos relativos a fonografia, fotografia, cinematografia e reprografia'),

-- 14 – Manutencao de bens
('14','140101','Lubrificacao, limpeza, lustração, revisao, carga e recarga, conserto, restauracao, blindagem, manutencao e conservacao de maquinas, veiculos, aparelhos, equipamentos, motores, elevadores ou de qualquer objeto (exceto pecas e partes empregadas, que ficam sujeitas ao ICMS)','Servicos relativos a bens de terceiros'),
('14','140201','Assistencia tecnica','Servicos relativos a bens de terceiros'),
('14','140301','Recondicionamento de motores (exceto pecas e partes empregadas, que ficam sujeitas ao ICMS)','Servicos relativos a bens de terceiros'),
('14','140401','Recauchutagem ou regeneracao de pneus','Servicos relativos a bens de terceiros'),
('14','140501','Restauracao, recondicionamento, acondicionamento, pintura, beneficiamento, lavagem, secagem, tingimento, galvanoplastia, anodizacao, corte, recorte, plastificacao, costura, acabamento, polimento e congeneres de objetos quaisquer','Servicos relativos a bens de terceiros'),
('14','140601','Instalacao e montagem de aparelhos, maquinas e equipamentos, inclusive montagem industrial, prestados ao usuario final, exclusivamente com material por ele fornecido','Servicos relativos a bens de terceiros'),
('14','140701','Colocacao de molduras e congeneres','Servicos relativos a bens de terceiros'),
('14','140801','Encadernacao, gravacao e douração de livros, revistas e congeneres','Servicos relativos a bens de terceiros'),
('14','140901','Alfaiataria e costura, quando o material for fornecido pelo usuario final, exceto aviamento','Servicos relativos a bens de terceiros'),
('14','141001','Tinturaria e lavanderia','Servicos relativos a bens de terceiros'),
('14','141101','Tapeçaria e reforma de estofamentos em geral','Servicos relativos a bens de terceiros'),
('14','141201','Funilaria e lanternagem','Servicos relativos a bens de terceiros'),
('14','141301','Carpintaria e serralheria','Servicos relativos a bens de terceiros'),
('14','141401','Guincho intramunicipal, guindaste e içamento','Servicos relativos a bens de terceiros'),

-- 15 – Servicos bancarios
('15','150101','Administracao de fundos quaisquer, de consorcio, de cartao de credito ou debito e congeneres, de carteira de clientes, de cheques pre-datados e congeneres','Servicos relacionados ao setor bancario ou financeiro, inclusive aqueles sujeitos a regulacao do Banco Central do Brasil'),
('15','150201','Abertura de contas em geral, inclusive conta-corrente, conta de investimentos e aplicacao e caderneta de poupanca, no Pais e no exterior, assim como a manutencao das referidas contas ativas e inativas','Servicos relacionados ao setor bancario ou financeiro, inclusive aqueles sujeitos a regulacao do Banco Central do Brasil'),
('15','150301','Locacao e manutencao de cofres particulares, de terminais eletronicos, de terminais de atendimento e de bens e equipamentos em geral','Servicos relacionados ao setor bancario ou financeiro, inclusive aqueles sujeitos a regulacao do Banco Central do Brasil'),
('15','150401','Fornecimento ou emissao de atestados em geral, inclusive atestado de idoneidade, atestado de capacidade financeira e congeneres','Servicos relacionados ao setor bancario ou financeiro, inclusive aqueles sujeitos a regulacao do Banco Central do Brasil'),
('15','150901','Arrendamento mercantil (leasing) de quaisquer bens, inclusive cessao de direitos e obrigacoes, substituicao de garantias, alteracao, cancelamento e registro de contrato, e demais servicos relacionados ao arrendamento mercantil (leasing)','Servicos relacionados ao setor bancario ou financeiro, inclusive aqueles sujeitos a regulacao do Banco Central do Brasil'),

-- 16 – Transporte
('16','160101','Servicos de transporte coletivo municipal rodoviario de passageiros','Servicos de transporte de natureza municipal'),

-- 17 – Apoio administrativo
('17','170101','Assessoria ou consultoria de qualquer natureza, nao contida em outros itens desta lista; analise, exame, pesquisa, coleta, compilacao e fornecimento de dados e informacoes de qualquer natureza, inclusive cadastro e similares','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','170201','Datilografia, digitacao, estenografia, expediente, secretaria em geral, resposta audivel, redacao, edicao, interpretacao, revisao, traducao, apoio e infra-estrutura administrativa e congeneres','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','170301','Planejamento, coordenacao, programacao ou organizacao tecnica, financeira ou administrativa','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','170401','Recrutamento, agenciamento, selecao e colocacao de mao-de-obra','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','170501','Fornecimento de mao-de-obra, mesmo em carater temporario, inclusive de empregados ou trabalhadores, avulsos ou temporarios, contratados pelo prestador de servico','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','170601','Propaganda e publicidade, inclusive promocao de vendas, planejamento de campanhas ou sistemas de publicidade, elaboracao de desenhos, textos e demais elementos de publicidade, nos servicos de relacoes publicas','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','170701','Franquia (franchising)','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','170801','Perícia, laudos, exames tecnicos e analises tecnicas','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','170901','Traducao e interpretacao','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171001','Avaliacao de bens e servicos de qualquer natureza','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171101','Auditoria','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171201','Analise de Organizacao e Metodos','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171301','Atuaria e calculos tecnicos de qualquer natureza','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171401','Contabilidade, inclusive servicos tecnicos e auxiliares','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171501','Consultoria e assessoria economica ou financeira','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171601','Estatistica','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171701','Cobranca em geral','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171801','Assessoria, analise, avaliacao, atendimento, consulta, cadastro, selecao, gerenciamento de informacoes, administracao de contas a receber ou a pagar e em geral, relacionados a operacoes de faturizacao (factoring)','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','171901','Apresentacao de palestras, conferencias, seminarios e congeneres','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),
('17','172001','Inserção de textos, desenhos e outros materiais de propaganda e publicidade, em qualquer meio (exceto em livros, jornais, periodicos e nas modalidades de servicos de radiodifusao sonora e de sons e imagens de recepcao livre e gratuita)','Servicos de apoio tecnico, administrativo, juridico, contabil, comercial e congeneres'),

-- 18 – Regulacao de sinistros
('18','180101','Regulacao de sinistros cobertos por contratos de seguros; inspecao e avaliacao de riscos para cobertura de contratos de seguros; prevencao e gerencia de riscos segurados ou a segurar; prestacao de informacoes cadastrais e financeiras','Servicos de regulacao de sinistros vinculados a contratos de seguros; inspeçao e avaliação de riscos para cobertura de contratos de seguros; prevenção e gerência de riscos segurados ou a segurar; prestação de informações cadastrais e financeiras'),

-- 19 – Distribuição e logistica
('19','190101','Servicos de distribuicao de bens de terceiros','Servicos de distribuicao e entrega de bens de terceiros'),

-- 20 – Portuarios
('20','200101','Servicos portuarios, ferroportuarios, utilizacao de porto, movimentacao de passageiros, reboque de embarcacoes, rebocador escoteiro, atracacao, desatracacao, servicos de praticagem, capatazia, armazenagem de qualquer natureza, servicos acessorios, movimentacao de mercadorias, servicos de apoio maritimo, de movimentacao ao largo, servicos de armadores, estiva, conferencia, logistica e congeneres','Servicos portuarios, aeroportuarios, ferroportuarios, de terminais rodoviarios, ferroviarios e metroviarios'),
('20','200201','Servicos aeroportuarios, utilizacao de aeroporto, movimentacao de passageiros, armazenagem de qualquer natureza, capatazia, movimentacao de aeronaves, servicos de apoio aeroportuarios, servicos acessorios, movimentacao de mercadorias, logistica e congeneres','Servicos portuarios, aeroportuarios, ferroportuarios, de terminais rodoviarios, ferroviarios e metroviarios'),

-- 21 – Registros publicos e cartorios
('21','210101','Servicos de registros publicos, cartorarios e notariais','Servicos de registros publicos, cartorarios e notariais'),

-- 22 – Exploração de rodovias
('22','220101','Pedagio','Servicos de exploracao de rodovias'),

-- 23 – Programação e comunicação visual
('23','230101','Publicidade e propaganda, exceto veiculacao, que e de competencia da Uniao','Servicos de programacao e comunicacao visual, desenho industrial e congeneres'),

-- 24 – Servicos financeiros
('24','240101','Servicos financeiros, bancarios e afins nao especificados em outros itens','Servicos financeiros, bancarios e de credito de qualquer especie'),

-- 25 – Registros
('25','250101','Cartorio','Servicos de registros publicos'),

-- 26 – Funerarios
('26','260101','Servicos funerarios','Servicos funerarios'),
('26','260201','Cineracao e translado de corpos','Servicos funerarios'),

-- 27 – Assistencia social
('27','270101','Servicos de assistencia social','Servicos de assistencia social')

ON CONFLICT (codigo) DO UPDATE
SET
  descricao  = EXCLUDED.descricao,
  grupo_desc = EXCLUDED.grupo_desc,
  updated_at = NOW();
