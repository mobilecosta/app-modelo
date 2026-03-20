# Frontend

Aplicação Angular 19 com PO UI para autenticação e gestão de cadastros.

## Requisitos

- Node.js 20+ recomendado
- npm

## Instalação

```bash
npm install
```

## Ambiente

O frontend usa o arquivo `src/environments/environment.ts` para apontar a API local:

```ts
apiUrl: 'http://localhost:3000/api'
```

Se o backend estiver em outra URL, ajuste esse valor antes de subir a aplicação.

## Scripts

- `npm start`: inicia o servidor de desenvolvimento Angular
- `npm run build`: gera o build de produção
- `npm run watch`: build contínuo em modo desenvolvimento
- `npm test`: executa os testes com Karma

## Execução local

```bash
npm start
```

Depois acesse `http://localhost:4200`.

## Principais rotas

- `/login`
- `/registro`
- `/dashboard`
- `/usuarios`
- `/tabelas`
- `/campos`
- `/menus`

As rotas protegidas usam `authGuard` e a navegação principal fica no layout `src/app/layout/shell.component.ts`.

## Estrutura

- `src/app/core`: serviços, guards, interceptors e modelos
- `src/app/features`: telas da aplicação
- `src/app/layout`: shell principal autenticado
- `src/environments`: configuração de ambiente

## Build

```bash
npm run build
```

Os arquivos gerados ficam em `frontend/dist/`.
