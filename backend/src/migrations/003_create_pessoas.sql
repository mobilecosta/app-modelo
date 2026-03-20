-- Migration: pessoas + atividades secundarias + qsa
-- Estrutura baseada no retorno do ReceitaWS
-- Execute apos a 002_create_sistemas_and_update_menus.sql

CREATE TABLE IF NOT EXISTS pessoas (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cnpj                       VARCHAR(18) NOT NULL UNIQUE,
  tipo                       VARCHAR(50),
  nome                       VARCHAR(255) NOT NULL,
  fantasia                   VARCHAR(255),
  porte                      VARCHAR(100),
  abertura                   VARCHAR(20),
  natureza_juridica          VARCHAR(255),
  atividade_principal_codigo VARCHAR(20),
  atividade_principal_texto  TEXT,
  logradouro                 VARCHAR(255),
  numero                     VARCHAR(50),
  complemento                VARCHAR(255),
  cep                        VARCHAR(10),
  bairro                     VARCHAR(255),
  municipio                  VARCHAR(255),
  uf                         VARCHAR(2),
  email                      VARCHAR(255),
  telefone                   VARCHAR(100),
  efr                        VARCHAR(255),
  situacao                   VARCHAR(100),
  data_situacao              VARCHAR(20),
  motivo_situacao            VARCHAR(255),
  situacao_especial          VARCHAR(255),
  data_situacao_especial     VARCHAR(20),
  capital_social             NUMERIC(15,2),
  ultima_atualizacao         TIMESTAMPTZ,
  status                     VARCHAR(50),
  ativo                      BOOLEAN NOT NULL DEFAULT true,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pessoas_atividades_secundarias (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pessoa_id   UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  codigo      VARCHAR(20) NOT NULL,
  descricao   TEXT NOT NULL,
  ordem       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pessoas_qsa (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pessoa_id        UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  nome             VARCHAR(255) NOT NULL,
  qualificacao     VARCHAR(255),
  pais_origem      VARCHAR(255),
  nome_rep_legal   VARCHAR(255),
  qual_rep_legal   VARCHAR(255),
  ordem            INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pessoas_cnpj ON pessoas(cnpj);
CREATE INDEX IF NOT EXISTS idx_pessoas_atividades_secundarias_pessoa_id ON pessoas_atividades_secundarias(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_qsa_pessoa_id ON pessoas_qsa(pessoa_id);

ALTER TABLE pessoas DISABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas_atividades_secundarias DISABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas_qsa DISABLE ROW LEVEL SECURITY;
