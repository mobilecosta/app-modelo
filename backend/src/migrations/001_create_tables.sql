-- Migration: Criacao das tabelas do sistema
-- Execute no SQL Editor do Supabase

-- Extensao para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  senha_hash  VARCHAR(255) NOT NULL,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: tabelas (dicionario de dados - definicao de tabelas)
CREATE TABLE IF NOT EXISTS tabelas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        VARCHAR(255) NOT NULL UNIQUE,
  descricao   TEXT,
  schema_nome VARCHAR(100) NOT NULL DEFAULT 'public',
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela: campos (dicionario de dados - definicao de campos por tabela)
CREATE TABLE IF NOT EXISTS campos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabela_id       UUID NOT NULL REFERENCES tabelas(id) ON DELETE CASCADE,
  nome            VARCHAR(255) NOT NULL,
  label           VARCHAR(255) NOT NULL,
  tipo            VARCHAR(50) NOT NULL CHECK (tipo IN ('text','number','boolean','date','datetime','select','textarea','email','password')),
  obrigatorio     BOOLEAN NOT NULL DEFAULT false,
  tamanho_maximo  INTEGER,
  valor_padrao    TEXT,
  opcoes          TEXT,
  ordem           INTEGER NOT NULL DEFAULT 0,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tabela_id, nome)
);

-- Tabela: menus
CREATE TABLE IF NOT EXISTS menus (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label       VARCHAR(255) NOT NULL,
  link        VARCHAR(500),
  icon        VARCHAR(100),
  menu_pai_id UUID REFERENCES menus(id) ON DELETE SET NULL,
  ordem       INTEGER NOT NULL DEFAULT 0,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_campos_tabela_id ON campos(tabela_id);
CREATE INDEX IF NOT EXISTS idx_menus_pai_id ON menus(menu_pai_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- RLS: desabilitar para uso com service_role no backend
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE tabelas  DISABLE ROW LEVEL SECURITY;
ALTER TABLE campos   DISABLE ROW LEVEL SECURITY;
ALTER TABLE menus    DISABLE ROW LEVEL SECURITY;

-- Dados iniciais: menus
INSERT INTO menus (label, link, icon, ordem) VALUES
  ('Dashboard',        '/dashboard',          'ph ph-house',           1),
  ('Dicionario',       NULL,                  'ph ph-database',        2),
  ('Usuarios',         '/usuarios',           'ph ph-users',           3),
  ('Configuracoes',    NULL,                  'ph ph-gear',            4)
ON CONFLICT DO NOTHING;

-- Submenus de Dicionario
INSERT INTO menus (label, link, icon, menu_pai_id, ordem)
SELECT 'Tabelas', '/tabelas', 'ph ph-table', id, 1 FROM menus WHERE label = 'Dicionario'
ON CONFLICT DO NOTHING;

INSERT INTO menus (label, link, icon, menu_pai_id, ordem)
SELECT 'Campos', '/campos', 'ph ph-columns', id, 2 FROM menus WHERE label = 'Dicionario'
ON CONFLICT DO NOTHING;

-- Submenus de Configuracoes
INSERT INTO menus (label, link, icon, menu_pai_id, ordem)
SELECT 'Menus', '/menus', 'ph ph-list', id, 1 FROM menus WHERE label = 'Configuracoes'
ON CONFLICT DO NOTHING;
