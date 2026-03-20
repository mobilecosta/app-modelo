-- Migration: sistema faturamento + menu pessoas juridicas
-- Execute apos a 003_create_pessoas.sql

INSERT INTO sistemas (codigo, nome, descricao, ativo)
VALUES (
  '3',
  'Faturamento',
  'Sistema de faturamento',
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
  'Pessoas Juridicas',
  '/pessoas_juridicas',
  'ph ph-buildings',
  NULL,
  1,
  true,
  '3'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'Pessoas Juridicas'
    AND sistema_codigo = '3'
);

UPDATE menus
SET
  link = '/pessoas_juridicas',
  icon = 'ph ph-buildings',
  ordem = 1,
  ativo = true,
  updated_at = NOW()
WHERE label = 'Pessoas Juridicas'
  AND sistema_codigo = '3';
