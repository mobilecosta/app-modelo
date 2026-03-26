-- Migration: menu Escrituracao NFC-e no sistema 3 (Faturamento)
-- Execute apos a 012_create_empresascertificados_listagemchaves_downloadxml.sql

INSERT INTO menus (label, link, icon, menu_pai_id, ordem, ativo, sistema_codigo)
SELECT
  'Escrituracao NFC-e',
  NULL,
  'ph ph-receipt',
  NULL,
  3,
  true,
  '3'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'Escrituracao NFC-e'
    AND sistema_codigo = '3'
);

UPDATE menus
SET
  link = NULL,
  icon = 'ph ph-receipt',
  menu_pai_id = NULL,
  ordem = 3,
  ativo = true,
  updated_at = NOW()
WHERE label = 'Escrituracao NFC-e'
  AND sistema_codigo = '3';

INSERT INTO menus (label, link, icon, menu_pai_id, ordem, ativo, sistema_codigo)
SELECT
  'EmpresasCertificados',
  '/empresascertificados',
  'ph ph-certificate',
  (
    SELECT id
    FROM menus
    WHERE label = 'Escrituracao NFC-e'
      AND sistema_codigo = '3'
    ORDER BY ordem, created_at
    LIMIT 1
  ),
  1,
  true,
  '3'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'EmpresasCertificados'
    AND sistema_codigo = '3'
);

UPDATE menus
SET
  link = '/empresascertificados',
  icon = 'ph ph-certificate',
  menu_pai_id = (
    SELECT id
    FROM menus
    WHERE label = 'Escrituracao NFC-e'
      AND sistema_codigo = '3'
    ORDER BY ordem, created_at
    LIMIT 1
  ),
  ordem = 1,
  ativo = true,
  updated_at = NOW()
WHERE label = 'EmpresasCertificados'
  AND sistema_codigo = '3';

INSERT INTO menus (label, link, icon, menu_pai_id, ordem, ativo, sistema_codigo)
SELECT
  'ListagemChaves',
  '/listagemchaves',
  'ph ph-list-magnifying-glass',
  (
    SELECT id
    FROM menus
    WHERE label = 'Escrituracao NFC-e'
      AND sistema_codigo = '3'
    ORDER BY ordem, created_at
    LIMIT 1
  ),
  2,
  true,
  '3'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'ListagemChaves'
    AND sistema_codigo = '3'
);

UPDATE menus
SET
  link = '/listagemchaves',
  icon = 'ph ph-list-magnifying-glass',
  menu_pai_id = (
    SELECT id
    FROM menus
    WHERE label = 'Escrituracao NFC-e'
      AND sistema_codigo = '3'
    ORDER BY ordem, created_at
    LIMIT 1
  ),
  ordem = 2,
  ativo = true,
  updated_at = NOW()
WHERE label = 'ListagemChaves'
  AND sistema_codigo = '3';

INSERT INTO menus (label, link, icon, menu_pai_id, ordem, ativo, sistema_codigo)
SELECT
  'DownloadXML',
  '/downloadxml',
  'ph ph-file-arrow-down',
  (
    SELECT id
    FROM menus
    WHERE label = 'Escrituracao NFC-e'
      AND sistema_codigo = '3'
    ORDER BY ordem, created_at
    LIMIT 1
  ),
  3,
  true,
  '3'
WHERE NOT EXISTS (
  SELECT 1
  FROM menus
  WHERE label = 'DownloadXML'
    AND sistema_codigo = '3'
);

UPDATE menus
SET
  link = '/downloadxml',
  icon = 'ph ph-file-arrow-down',
  menu_pai_id = (
    SELECT id
    FROM menus
    WHERE label = 'Escrituracao NFC-e'
      AND sistema_codigo = '3'
    ORDER BY ordem, created_at
    LIMIT 1
  ),
  ordem = 3,
  ativo = true,
  updated_at = NOW()
WHERE label = 'DownloadXML'
  AND sistema_codigo = '3';
