-- Migration: inicializacao da tabela campos com base na estrutura de pessoas
-- Execute apos a 013_create_menu_escrituracao_nfce.sql

INSERT INTO tabelas (nome, descricao, schema_nome, ativo)
VALUES (
  'pessoas',
  'Cadastro de pessoas juridicas baseado no retorno do ReceitaWS.',
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
  WHERE nome = 'pessoas';

  FOR rec IN
    SELECT column_name, data_type, is_nullable, ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pessoas'
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
