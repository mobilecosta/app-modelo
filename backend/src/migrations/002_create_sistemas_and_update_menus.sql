-- Migration: sistemas + menus por sistema
-- Execute apos a 001_create_tables.sql

CREATE TABLE IF NOT EXISTS sistemas (
  codigo      VARCHAR(100) PRIMARY KEY,
  nome        VARCHAR(255) NOT NULL,
  descricao   TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sistemas DISABLE ROW LEVEL SECURITY;

INSERT INTO sistemas (codigo, nome, descricao, ativo)
VALUES ('dicionario', 'Dicionario', 'Sistema padrao do dicionario de dados', true)
ON CONFLICT (codigo) DO NOTHING;

ALTER TABLE menus
ADD COLUMN IF NOT EXISTS sistema_codigo VARCHAR(100);

UPDATE menus
SET sistema_codigo = 'dicionario'
WHERE sistema_codigo IS NULL;

ALTER TABLE menus
ALTER COLUMN sistema_codigo SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'menus_sistema_codigo_fkey'
      AND table_name = 'menus'
  ) THEN
    ALTER TABLE menus
    ADD CONSTRAINT menus_sistema_codigo_fkey
    FOREIGN KEY (sistema_codigo) REFERENCES sistemas(codigo);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_menus_sistema_codigo ON menus(sistema_codigo);
