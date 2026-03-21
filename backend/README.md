# Backend

API em Node.js + TypeScript com Express, autenticação JWT e integração com Supabase.

## Requisitos

- Node.js 20+ recomendado
- npm
- Projeto Supabase configurado

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` em `backend/` com base no `.env.example`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
JWT_SECRET=sua-chave-secreta-jwt
PORT=3000
NUVEM_FISCAL_BASE_URL=https://api.nuvemfiscal.com.br
NUVEM_FISCAL_TOKEN_URL=https://auth.nuvemfiscal.com.br/oauth/token
NUVEM_FISCAL_SCOPE=nfse
# Opcao 1: token direto
# NUVEM_FISCAL_ACCESS_TOKEN=seu-access-token
# Opcao 2: client credentials
# NUVEM_FISCAL_CLIENT_ID=seu-client-id
# NUVEM_FISCAL_CLIENT_SECRET=seu-client-secret
```

## Scripts

- `npm run dev`: inicia a API em modo desenvolvimento com `nodemon`
- `npm run build`: compila o projeto para `dist/`
- `npm run start`: executa a versão compilada

## Execução local

```bash
npm run dev
```

Por padrão, a API sobe na porta `3000`.

## Rotas principais

- `GET /health`
- `GET /api/health`
- `POST /api/auth`
- `GET /api/usuarios`
- `GET /api/tabelas`
- `GET /api/campos`
- `GET /api/menus`
- `GET /api/sistemas`
- `GET /api/pessoas`
- `GET /api/pessoas/receitaws/:cnpj`
- `POST /api/nfse_servicos/:id/enviar` (emite NFS-e na Nuvem Fiscal com base no registro salvo)

As rotas são registradas em `src/server.ts` e os módulos ficam organizados em `controllers/`, `routes/`, `middlewares/`, `models/` e `config/`.

## Build

Após compilar, os arquivos gerados ficam em `backend/dist/`.
