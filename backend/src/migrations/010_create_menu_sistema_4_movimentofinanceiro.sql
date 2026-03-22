-- Migration: menus do sistema 4 (financeiro)
-- Inclui menu para a tabela movimentofinanceiro
-- Execute apos a 009_create_movimentofinanceiro.sql

INSERT INTO sistemas (codigo, nome, descricao, ativo)
VALUES (
  '4',
  'Financeiro',
  'Financeiro',
  true
)
ON CONFLICT (codigo) DO UPDATE
SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  updated_at = NOW();

INSERT INTO menus (label, link, icon, menu_pai_id, ordem, ativo, sistema_codigo)
SELECT
  'Financeiro',
  NULL,
  'ph ph-wallet',
  NULL,
  1,
  true,
  '4'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'Financeiro'
    AND sistema_codigo = '4'
);

UPDATE menus
SET
  link = NULL,
  icon = 'ph ph-wallet',
  ordem = 1,
  ativo = true,
  updated_at = NOW()
WHERE label = 'Financeiro'
  AND sistema_codigo = '4';

INSERT INTO menus (label, link, icon, menu_pai_id, ordem, ativo, sistema_codigo)
SELECT
  'Movimento Financeiro',
  '/movimentofinanceiro',
  'ph ph-currency-circle-dollar',
  (
    SELECT id
    FROM menus
    WHERE label = 'Financeiro'
      AND sistema_codigo = '4'
    ORDER BY ordem, created_at
    LIMIT 1
  ),
  1,
  true,
  '4'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'Movimento Financeiro'
    AND sistema_codigo = '4'
);

UPDATE menus
SET
  link = '/movimentofinanceiro',
  icon = 'ph ph-currency-circle-dollar',
  menu_pai_id = (
    SELECT id
    FROM menus
    WHERE label = 'Financeiro'
      AND sistema_codigo = '4'
    ORDER BY ordem, created_at
    LIMIT 1
  ),
  ordem = 1,
  ativo = true,
  updated_at = NOW()
WHERE label = 'Movimento Financeiro'
  AND sistema_codigo = '4';
