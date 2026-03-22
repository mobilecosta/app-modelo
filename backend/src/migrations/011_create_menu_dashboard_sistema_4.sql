-- Migration: menu dashboard para o sistema 4
-- Execute apos a 010_create_menu_sistema_4_movimentofinanceiro.sql

INSERT INTO menus (label, link, icon, menu_pai_id, ordem, ativo, sistema_codigo)
SELECT
  'Dashboard',
  '/dashboard_financeiro',
  'ph ph-chart-line-up',
  NULL,
  0,
  true,
  '4'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'Dashboard'
    AND sistema_codigo = '4'
);

UPDATE menus
SET
  link = '/dashboard_financeiro',
  icon = 'ph ph-chart-line-up',
  menu_pai_id = NULL,
  ordem = 0,
  ativo = true,
  updated_at = NOW()
WHERE label = 'Dashboard'
  AND sistema_codigo = '4';
