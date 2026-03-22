-- Migration: cria tabela movimentofinanceiro
-- tipo: 1 = Entrada, 2 = Saida
-- Execute apos a 008_upsert_sistema_3_financeiro.sql

CREATE TABLE IF NOT EXISTS movimentofinanceiro (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo            INTEGER NOT NULL CHECK (tipo IN (1, 2)),
  descricao       TEXT,
  valor           NUMERIC(15,2) NOT NULL DEFAULT 0,
  data_movimento  DATE NOT NULL DEFAULT CURRENT_DATE,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimentofinanceiro_tipo ON movimentofinanceiro(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentofinanceiro_data_movimento ON movimentofinanceiro(data_movimento);

ALTER TABLE movimentofinanceiro DISABLE ROW LEVEL SECURITY;
