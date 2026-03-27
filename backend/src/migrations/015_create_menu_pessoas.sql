-- Migration: inclusao/ajuste de menu para rota pessoas no sistema faturamento
-- Execute apos a 014_initialize_campos_pessoas.sql

-- Garante a existencia do menu "Pessoas"
INSERT INTO menus (label, link, icon, menu_pai_id, ordem, ativo, sistema_codigo)
SELECT
  'Pessoas',
  '/pessoas',
  'ph ph-buildings',
  NULL,
  1,
  true,
  '3'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'Pessoas'
    AND sistema_codigo = '3'
);

-- Padroniza o menu "Pessoas"
UPDATE menus
SET
  link = '/pessoas',
  icon = 'ph ph-buildings',
  menu_pai_id = NULL,
  ordem = 1,
  ativo = true,
  updated_at = NOW()
WHERE label = 'Pessoas'
  AND sistema_codigo = '3';
