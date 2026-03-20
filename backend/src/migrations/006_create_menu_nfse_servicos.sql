-- Migration: menu nfse_servicos no sistema faturamento
-- Execute apos a 005_create_nfse_servicos.sql

INSERT INTO menus (label, link, icon, menu_pai_id, ordem, ativo, sistema_codigo)
SELECT
  'NFS-e Servicos',
  '/nfse_servicos',
  'ph ph-receipt',
  NULL,
  2,
  true,
  '3'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'NFS-e Servicos'
    AND sistema_codigo = '3'
);

UPDATE menus
SET
  link = '/nfse_servicos',
  icon = 'ph ph-receipt',
  ordem = 2,
  ativo = true,
  updated_at = NOW()
WHERE label = 'NFS-e Servicos'
  AND sistema_codigo = '3';
