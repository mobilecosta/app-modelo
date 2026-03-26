-- Migration: cria tabelas empresascertificados, listagemchaves e downloadxml
-- Execute apos a 011_create_menu_dashboard_sistema_4.sql

CREATE TABLE IF NOT EXISTS empresascertificados (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cnpj                    VARCHAR(18) NOT NULL UNIQUE
                          CHECK (cnpj ~ '^[0-9]{14}$|^[0-9]{2}\.[0-9]{3}\.[0-9]{3}/[0-9]{4}-[0-9]{2}$'),
  certificado_pfx_base64  TEXT NOT NULL,
  senha_certificado       VARCHAR(255) NOT NULL,
  ativo                   BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listagemchaves (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id        UUID REFERENCES empresascertificados(id) ON DELETE SET NULL,
  cnpj              VARCHAR(18) NOT NULL
                    CHECK (cnpj ~ '^[0-9]{14}$|^[0-9]{2}\.[0-9]{3}\.[0-9]{3}/[0-9]{4}-[0-9]{2}$'),
  chave_acesso      VARCHAR(44) NOT NULL UNIQUE,
  data_emissao      TIMESTAMPTZ,
  valor_total       NUMERIC(15,2),
  protocolo         VARCHAR(50),
  situacao          VARCHAR(100),
  retorno_servico   JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS downloadxml (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id        UUID REFERENCES empresascertificados(id) ON DELETE SET NULL,
  chave_acesso      VARCHAR(44) NOT NULL UNIQUE,
  cnpj              VARCHAR(18) NOT NULL
                    CHECK (cnpj ~ '^[0-9]{14}$|^[0-9]{2}\.[0-9]{3}\.[0-9]{3}/[0-9]{4}-[0-9]{2}$'),
  xml_base64        TEXT NOT NULL,
  xml_decodificado  TEXT,
  status_download   VARCHAR(50) NOT NULL DEFAULT 'baixado',
  retorno_servico   JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empresascertificados_cnpj ON empresascertificados(cnpj);
CREATE INDEX IF NOT EXISTS idx_listagemchaves_empresa_id ON listagemchaves(empresa_id);
CREATE INDEX IF NOT EXISTS idx_listagemchaves_cnpj ON listagemchaves(cnpj);
CREATE INDEX IF NOT EXISTS idx_listagemchaves_data_emissao ON listagemchaves(data_emissao);
CREATE INDEX IF NOT EXISTS idx_downloadxml_empresa_id ON downloadxml(empresa_id);
CREATE INDEX IF NOT EXISTS idx_downloadxml_cnpj ON downloadxml(cnpj);

ALTER TABLE empresascertificados DISABLE ROW LEVEL SECURITY;
ALTER TABLE listagemchaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE downloadxml DISABLE ROW LEVEL SECURITY;
