-- Migration: tabela unica nfse_servicos baseada no JSON de emissao da DPS/NFS-e
-- Referencia: https://dev.nuvemfiscal.com.br/docs/api#tag/Nfse/operation/EmitirNfseDps
-- Execute apos a 004_create_sistema_faturamento_and_menu_pessoas_juridicas.sql

CREATE TABLE IF NOT EXISTS nfse_servicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provedor VARCHAR(30),
  ambiente VARCHAR(30),
  referencia VARCHAR(50),
  infDPS_tpAmb INTEGER,
  infDPS_dhEmi TIMESTAMPTZ,
  infDPS_verAplic VARCHAR(255),
  infDPS_dCompet DATE,
  infDPS_cMotivoEmisTI INTEGER,
  infDPS_chNFSeRej VARCHAR(255),
  infDPS_subst_chSubstda VARCHAR(255),
  infDPS_subst_cMotivo VARCHAR(100),
  infDPS_subst_xMotivo VARCHAR(255),
  infDPS_prest_CNPJ VARCHAR(20),
  infDPS_prest_CPF VARCHAR(20),
  infDPS_prest_regTrib_regEspTrib INTEGER,
  infDPS_toma_pessoa_id UUID REFERENCES pessoas(id) ON DELETE SET NULL,
  infDPS_toma_orgaoPublico BOOLEAN NOT NULL DEFAULT false,
  infDPS_toma_CNPJ VARCHAR(20),
  infDPS_toma_CPF VARCHAR(20),
  infDPS_toma_NIF VARCHAR(100),
  infDPS_toma_cNaoNIF INTEGER,
  infDPS_toma_CAEPF VARCHAR(100),
  infDPS_toma_IM VARCHAR(100),
  infDPS_toma_IE VARCHAR(100),
  infDPS_toma_xNome VARCHAR(255),
  infDPS_toma_end_endNac_cMun VARCHAR(20),
  infDPS_toma_end_endNac_CEP VARCHAR(10),
  infDPS_toma_end_endExt_cPais VARCHAR(10),
  infDPS_toma_end_endExt_cEndPost VARCHAR(30),
  infDPS_toma_end_endExt_xCidade VARCHAR(255),
  infDPS_toma_end_endExt_xEstProvReg VARCHAR(255),
  infDPS_toma_end_xLgr VARCHAR(255),
  infDPS_toma_end_tpLgr VARCHAR(100),
  infDPS_toma_end_nro VARCHAR(50),
  infDPS_toma_end_xCpl VARCHAR(255),
  infDPS_toma_end_xBairro VARCHAR(255),
  infDPS_toma_fone VARCHAR(100),
  infDPS_toma_email VARCHAR(255),
  infDPS_interm_CNPJ VARCHAR(20),
  infDPS_interm_CPF VARCHAR(20),
  infDPS_interm_NIF VARCHAR(100),
  infDPS_interm_cNaoNIF INTEGER,
  infDPS_interm_CAEPF VARCHAR(100),
  infDPS_interm_IM VARCHAR(100),
  infDPS_interm_IE VARCHAR(100),
  infDPS_interm_xNome VARCHAR(255),
  infDPS_interm_end_endNac_cMun VARCHAR(20),
  infDPS_interm_end_endNac_CEP VARCHAR(10),
  infDPS_interm_end_endExt_cPais VARCHAR(10),
  infDPS_interm_end_endExt_cEndPost VARCHAR(30),
  infDPS_interm_end_endExt_xCidade VARCHAR(255),
  infDPS_interm_end_endExt_xEstProvReg VARCHAR(255),
  infDPS_interm_end_xLgr VARCHAR(255),
  infDPS_interm_end_tpLgr VARCHAR(100),
  infDPS_interm_end_nro VARCHAR(50),
  infDPS_interm_end_xCpl VARCHAR(255),
  infDPS_interm_end_xBairro VARCHAR(255),
  infDPS_interm_fone VARCHAR(100),
  infDPS_interm_email VARCHAR(255),
  infDPS_serv_locPrest_cLocPrestacao VARCHAR(50),
  infDPS_serv_locPrest_cPaisPrestacao VARCHAR(10),
  infDPS_serv_cServ_cTribNac VARCHAR(50),
  infDPS_serv_cServ_cTribMun VARCHAR(50),
  infDPS_serv_cServ_CNAE VARCHAR(20),
  infDPS_serv_cServ_xDescServ TEXT,
  infDPS_serv_cServ_cNBS VARCHAR(30),
  infDPS_serv_cServ_cNatOp VARCHAR(30),
  infDPS_serv_cServ_cSitTrib VARCHAR(30),
  infDPS_serv_comExt_mdPrestacao INTEGER,
  infDPS_serv_comExt_vincPrest INTEGER,
  infDPS_serv_comExt_tpMoeda VARCHAR(10),
  infDPS_serv_comExt_vServMoeda NUMERIC(15,2),
  infDPS_serv_comExt_mecAFComexP VARCHAR(100),
  infDPS_serv_comExt_mecAFComexT VARCHAR(100),
  infDPS_serv_comExt_movTempBens INTEGER,
  infDPS_serv_comExt_nDI VARCHAR(100),
  infDPS_serv_comExt_nRE VARCHAR(100),
  infDPS_serv_comExt_mdic INTEGER,
  infDPS_serv_lsadppu_categ INTEGER,
  infDPS_serv_lsadppu_objeto INTEGER,
  infDPS_serv_lsadppu_extensao VARCHAR(50),
  infDPS_serv_lsadppu_nPostes VARCHAR(50),
  infDPS_serv_obra_inscImobFisc VARCHAR(100),
  infDPS_serv_obra_cObra VARCHAR(100),
  infDPS_serv_obra_cCIB VARCHAR(100),
  infDPS_serv_obra_end_CEP VARCHAR(10),
  infDPS_serv_obra_end_endExt_cEndPost VARCHAR(30),
  infDPS_serv_obra_end_endExt_xCidade VARCHAR(255),
  infDPS_serv_obra_end_endExt_xEstProvReg VARCHAR(255),
  infDPS_serv_obra_end_xLgr VARCHAR(255),
  infDPS_serv_obra_end_tpLgr VARCHAR(100),
  infDPS_serv_obra_end_nro VARCHAR(50),
  infDPS_serv_obra_end_xCpl VARCHAR(255),
  infDPS_serv_obra_end_xBairro VARCHAR(255),
  infDPS_serv_atvEvento_xNome VARCHAR(255),
  infDPS_serv_atvEvento_desc TEXT,
  infDPS_serv_atvEvento_dtIni DATE,
  infDPS_serv_atvEvento_dtFim DATE,
  infDPS_serv_atvEvento_idAtvEvt VARCHAR(100),
  infDPS_serv_atvEvento_id VARCHAR(100),
  infDPS_serv_atvEvento_end_CEP VARCHAR(10),
  infDPS_serv_atvEvento_end_endExt_cEndPost VARCHAR(30),
  infDPS_serv_atvEvento_end_endExt_xCidade VARCHAR(255),
  infDPS_serv_atvEvento_end_endExt_xEstProvReg VARCHAR(255),
  infDPS_serv_atvEvento_end_xLgr VARCHAR(255),
  infDPS_serv_atvEvento_end_tpLgr VARCHAR(100),
  infDPS_serv_atvEvento_end_nro VARCHAR(50),
  infDPS_serv_atvEvento_end_xCpl VARCHAR(255),
  infDPS_serv_atvEvento_end_xBairro VARCHAR(255),
  infDPS_serv_explRod_categVeic VARCHAR(50),
  infDPS_serv_explRod_nEixos VARCHAR(20),
  infDPS_serv_explRod_rodagem INTEGER,
  infDPS_serv_explRod_sentido VARCHAR(50),
  infDPS_serv_explRod_placa VARCHAR(20),
  infDPS_serv_explRod_codAcessoPed VARCHAR(100),
  infDPS_serv_explRod_codContrato VARCHAR(100),
  infDPS_serv_infoCompl_idDocTec VARCHAR(100),
  infDPS_serv_infoCompl_docRef VARCHAR(100),
  infDPS_serv_infoCompl_xPed VARCHAR(100),
  infDPS_serv_infoCompl_gItemPed_xItemPed JSONB,
  infDPS_serv_infoCompl_xInfComp TEXT,
  infDPS_valores_vServPrest_vReceb NUMERIC(15,2),
  infDPS_valores_vServPrest_vServ NUMERIC(15,2),
  infDPS_valores_vDescCondIncond_vDescIncond NUMERIC(15,2),
  infDPS_valores_vDescCondIncond_vDescCond NUMERIC(15,2),
  infDPS_valores_vDedRed_pDR NUMERIC(10,6),
  infDPS_valores_vDedRed_vDR NUMERIC(15,2),
  infDPS_valores_vDedRed_documentos_docDedRed JSONB,
  infDPS_valores_trib_tribMun_tribISSQN INTEGER,
  infDPS_valores_trib_tribMun_cPaisResult VARCHAR(10),
  infDPS_valores_trib_tribMun_tpImunidade INTEGER,
  infDPS_valores_trib_tribMun_exigSusp_tpSusp INTEGER,
  infDPS_valores_trib_tribMun_exigSusp_nProcesso VARCHAR(100),
  infDPS_valores_trib_tribMun_BM_tpBM INTEGER,
  infDPS_valores_trib_tribMun_BM_nBM VARCHAR(100),
  infDPS_valores_trib_tribMun_BM_vRedBCBM NUMERIC(15,2),
  infDPS_valores_trib_tribMun_BM_pRedBCBM NUMERIC(10,6),
  infDPS_valores_trib_tribMun_tpRetISSQN INTEGER,
  infDPS_valores_trib_tribMun_pAliq NUMERIC(10,6),
  infDPS_valores_trib_tribMun_cLocIncid VARCHAR(20),
  infDPS_valores_trib_tribMun_vBC NUMERIC(15,2),
  infDPS_valores_trib_tribMun_vISSQN NUMERIC(15,2),
  infDPS_valores_trib_tribMun_vLiq NUMERIC(15,2),
  infDPS_valores_trib_tribFed_piscofins_CST VARCHAR(10),
  infDPS_valores_trib_tribFed_piscofins_vBCPisCofins NUMERIC(15,2),
  infDPS_valores_trib_tribFed_piscofins_pAliqPis NUMERIC(10,6),
  infDPS_valores_trib_tribFed_piscofins_pAliqCofins NUMERIC(10,6),
  infDPS_valores_trib_tribFed_piscofins_vPis NUMERIC(15,2),
  infDPS_valores_trib_tribFed_piscofins_vCofins NUMERIC(15,2),
  infDPS_valores_trib_tribFed_piscofins_tpRetPisCofins INTEGER,
  infDPS_valores_trib_tribFed_vRetCP NUMERIC(15,2),
  infDPS_valores_trib_tribFed_vRetIRRF NUMERIC(15,2),
  infDPS_valores_trib_tribFed_vRetCSLL NUMERIC(15,2),
  infDPS_valores_trib_totTrib_vTotTrib_vTotTribFed NUMERIC(15,2),
  infDPS_valores_trib_totTrib_vTotTrib_vTotTribEst NUMERIC(15,2),
  infDPS_valores_trib_totTrib_vTotTrib_vTotTribMun NUMERIC(15,2),
  infDPS_valores_trib_totTrib_pTotTrib_pTotTribFed NUMERIC(10,6),
  infDPS_valores_trib_totTrib_pTotTrib_pTotTribEst NUMERIC(10,6),
  infDPS_valores_trib_totTrib_pTotTrib_pTotTribMun NUMERIC(10,6),
  infDPS_valores_trib_totTrib_indTotTrib INTEGER,
  infDPS_valores_trib_totTrib_pTotTribSN NUMERIC(10,6),
  infDPS_IBSCBS_finNFSe INTEGER,
  infDPS_IBSCBS_indFinal INTEGER,
  infDPS_IBSCBS_cIndOp VARCHAR(100),
  infDPS_IBSCBS_tpOper INTEGER,
  infDPS_IBSCBS_gRefNFSe_refNFSe JSONB,
  infDPS_IBSCBS_tpEnteGov INTEGER,
  infDPS_IBSCBS_indDest INTEGER,
  infDPS_IBSCBS_dest_CNPJ VARCHAR(20),
  infDPS_IBSCBS_dest_CPF VARCHAR(20),
  infDPS_IBSCBS_dest_NIF VARCHAR(100),
  infDPS_IBSCBS_dest_cNaoNIF INTEGER,
  infDPS_IBSCBS_dest_xNome VARCHAR(255),
  infDPS_IBSCBS_dest_end_endNac_cMun VARCHAR(20),
  infDPS_IBSCBS_dest_end_endNac_CEP VARCHAR(10),
  infDPS_IBSCBS_dest_end_endExt_cPais VARCHAR(10),
  infDPS_IBSCBS_dest_end_endExt_cEndPost VARCHAR(30),
  infDPS_IBSCBS_dest_end_endExt_xCidade VARCHAR(255),
  infDPS_IBSCBS_dest_end_endExt_xEstProvReg VARCHAR(255),
  infDPS_IBSCBS_dest_end_xLgr VARCHAR(255),
  infDPS_IBSCBS_dest_end_tpLgr VARCHAR(100),
  infDPS_IBSCBS_dest_end_nro VARCHAR(50),
  infDPS_IBSCBS_dest_end_xCpl VARCHAR(255),
  infDPS_IBSCBS_dest_end_xBairro VARCHAR(255),
  infDPS_IBSCBS_dest_fone VARCHAR(100),
  infDPS_IBSCBS_dest_email VARCHAR(255),
  infDPS_IBSCBS_imovel_inscImobFisc VARCHAR(100),
  infDPS_IBSCBS_imovel_cCIB VARCHAR(100),
  infDPS_IBSCBS_imovel_end_CEP VARCHAR(10),
  infDPS_IBSCBS_imovel_end_endExt_cEndPost VARCHAR(30),
  infDPS_IBSCBS_imovel_end_endExt_xCidade VARCHAR(255),
  infDPS_IBSCBS_imovel_end_endExt_xEstProvReg VARCHAR(255),
  infDPS_IBSCBS_imovel_end_xLgr VARCHAR(255),
  infDPS_IBSCBS_imovel_end_tpLgr VARCHAR(100),
  infDPS_IBSCBS_imovel_end_nro VARCHAR(50),
  infDPS_IBSCBS_imovel_end_xCpl VARCHAR(255),
  infDPS_IBSCBS_imovel_end_xBairro VARCHAR(255),
  infDPS_IBSCBS_valores_gReeRepRes_documentos JSONB,
  infDPS_IBSCBS_valores_trib_gIBSCBS_CST VARCHAR(10),
  infDPS_IBSCBS_valores_trib_gIBSCBS_cClassTrib VARCHAR(100),
  infDPS_IBSCBS_valores_trib_gIBSCBS_cCredPres VARCHAR(100),
  infDPS_IBSCBS_valores_trib_gIBSCBS_gTribRegular_CSTReg VARCHAR(10),
  infDPS_IBSCBS_valores_trib_gIBSCBS_gTribRegular_cClassTribReg VARCHAR(100),
  infDPS_IBSCBS_valores_trib_gIBSCBS_gDif_pDifUF NUMERIC(10,6),
  infDPS_IBSCBS_valores_trib_gIBSCBS_gDif_pDifMun NUMERIC(10,6),
  infDPS_IBSCBS_valores_trib_gIBSCBS_gDif_pDifCBS NUMERIC(10,6),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfse_servicos_referencia ON nfse_servicos(referencia);
CREATE INDEX IF NOT EXISTS idx_nfse_servicos_toma_pessoa_id ON nfse_servicos(infDPS_toma_pessoa_id);
CREATE INDEX IF NOT EXISTS idx_nfse_servicos_toma_cnpj ON nfse_servicos(infDPS_toma_CNPJ);
CREATE INDEX IF NOT EXISTS idx_nfse_servicos_prest_cnpj ON nfse_servicos(infDPS_prest_CNPJ);
CREATE INDEX IF NOT EXISTS idx_nfse_servicos_ambiente ON nfse_servicos(ambiente);

ALTER TABLE nfse_servicos DISABLE ROW LEVEL SECURITY;

INSERT INTO tabelas (nome, descricao, schema_nome, ativo)
VALUES (
  'nfse_servicos',
  'Tabela unica de NFS-e com campos nomeados pelo caminho das tags do JSON de emissao.',
  'public',
  true
)
ON CONFLICT (nome) DO UPDATE
SET
  descricao = EXCLUDED.descricao,
  schema_nome = EXCLUDED.schema_nome,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

DO $$
DECLARE
  v_tabela_id UUID;
  rec RECORD;
BEGIN
  SELECT id INTO v_tabela_id
  FROM tabelas
  WHERE nome = 'nfse_servicos';

  FOR rec IN
    SELECT column_name, data_type, is_nullable, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'nfse_servicos'
      AND column_name NOT IN ('id', 'created_at', 'updated_at')
    ORDER BY ordinal_position
  LOOP
    INSERT INTO campos (tabela_id, nome, label, tipo, obrigatorio, ordem, ativo)
    VALUES (
      v_tabela_id,
      rec.column_name,
      REPLACE(rec.column_name, '_', ' '),
      CASE
        WHEN rec.data_type = 'boolean' THEN 'boolean'
        WHEN rec.data_type IN ('smallint', 'integer', 'bigint', 'numeric', 'real', 'double precision') THEN 'number'
        WHEN rec.data_type = 'date' THEN 'date'
        WHEN rec.data_type LIKE 'timestamp%' THEN 'datetime'
        ELSE 'text'
      END,
      rec.is_nullable = 'NO',
      rec.ordinal_position,
      true
    )
    ON CONFLICT (tabela_id, nome) DO UPDATE
    SET
      label = EXCLUDED.label,
      tipo = EXCLUDED.tipo,
      obrigatorio = EXCLUDED.obrigatorio,
      ordem = EXCLUDED.ordem,
      ativo = EXCLUDED.ativo,
      updated_at = NOW();
  END LOOP;
END $$;
