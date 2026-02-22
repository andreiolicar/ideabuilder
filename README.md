# TCC Idea Builder

TCC Idea Builder e um software web que auxilia estudantes na criacao, estruturacao e organizacao de ideias para TCC (Trabalho de Conclusao de Curso), gerando automaticamente documentacoes padronizadas com apoio de Inteligencia Artificial.

O objetivo e reduzir a dificuldade inicial de definir um tema, um escopo e um plano de desenvolvimento viavel, alem de oferecer uma organizacao clara dos projetos ao longo do tempo.

---

## A dor que originou o projeto

Durante cursos tecnicos e tecnologos, e comum que estudantes enfrentem dificuldades como:

- Nao saber por onde comecar um TCC
- Ter varias ideias soltas, sem estrutura
- Falta de padronizacao entre propostas de diferentes integrantes
- Dificuldade em transformar uma ideia em um plano executavel

Normalmente, essas definicoes consomem semanas e geram retrabalho.

O TCC Idea Builder surge para resolver esse problema oferecendo um processo guiado, rapido e padronizado para transformar uma ideia em documentacao clara e organizada.

---

## Como funciona

1. O usuario cria uma conta e acessa a area restrita.
2. Clica em Criar Projeto.
3. Preenche um formulario breve com:
   - tipo/categoria
   - descricao da ideia
   - tags
   - custo maximo
   - preferencias e restricoes
4. O sistema usa IA para gerar automaticamente:
   - Documento Geral
   - Documento de Especificacoes Tecnicas
   - Roadmap de Desenvolvimento (ate 2 anos)
5. O projeto e salvo como pasta/card com as documentacoes organizadas.

Cada geracao consome 1 credito do usuario.

---

## Estrutura de organizacao

- Projetos organizados em cards (pastas)
- Busca por nome
- Filtros por categoria e tags
- Cada projeto possui:
  - Geral
  - Especificacoes Tecnicas
  - Roadmap

Observacao:
- Projetos com status `FAILED` nao sao exibidos na lista de cards do dashboard.

---

## Sistema de creditos

- Cada usuario possui um saldo de creditos
- Cada geracao de projeto consome 1 credito
- Administrador via backoffice pode:
  - adicionar creditos
  - remover creditos
  - visualizar historico de consumo

---

## Tecnologias

### Backend

- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT (Access Token + Refresh Token)
- bcrypt

### Frontend

- React (Vite)
- Tailwind CSS
- React Router
- Axios

### Infraestrutura

- Deploy no Render

---

## Interface

A interface segue um padrao minimalista inspirado em produtos da Apple, priorizando:

- simplicidade
- espaco em branco
- tipografia clara
- foco no conteudo

---

## Objetivo academico

Este projeto esta sendo desenvolvido para auxiliar estudantes que buscam ideias para TCC em cursos tecnicos de Desenvolvimento de Sistemas e tecnologos de Analise e Desenvolvimento de Sistemas.

---

## Possiveis evolucoes futuras

- Templates especificos por area (Saude, Educacao, Industria, etc)
- Exportacao de projetos em ZIP ou PDF
- Compartilhamento de projetos
- Colaboracao em equipe
- Planos pagos

---

## Status do projeto

Em desenvolvimento (MVP)

---

## Setup local

1. Configure variaveis de ambiente:
   - `backend/.env` (base em `backend/.env.example`)
   - `frontend/.env` (base em `frontend/.env.example`)
2. Instale dependencias:
   - `npm run install:all`
3. Rode migrations/seeders:
   - `npm run db:setup`
4. Suba backend + frontend:
   - `npm run dev`

Base URL local da API: `http://localhost:4000/api`

---

## Variaveis de ambiente

### Backend (`backend/.env`)

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `DATABASE_URL_TEST`
- `CORS_ORIGIN`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

### Frontend (`frontend/.env`)

- `VITE_API_URL`

---

## Endpoints principais (resumo)

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Projects:

- `GET /api/projects`
- `POST /api/projects/generate`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

Admin (requer role ADMIN):

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/credits`
- `GET /api/admin/credits/ledger`

---

## Observacoes de infraestrutura

- `helmet` habilitado
- `cors` configurado por `CORS_ORIGIN` (aceita lista separada por virgula)
- rate limit aplicado em `/auth/*` e `POST /projects/generate`
- validacao centralizada com middleware `validate` (Zod)
- tratamento de erro padronizado com `code` e `message`
- logs de request via `morgan`
- idempotencia de geracao via header `Idempotency-Key`

---

## Comandos na raiz

Instalar dependencias de backend + frontend:

```bash
npm run install:all
```

Rodar backend + frontend em desenvolvimento:

```bash
npm run dev
```

Rodar build completo do workspace:

```bash
npm run build
```

Build individual:

```bash
npm run build:backend
npm run build:frontend
```

Rodar migrations e seeders:

```bash
npm run db:setup
```

---

## Deploy no Render

### Backend (Web Service)

Crie um Web Service no Render apontando para este repositorio.

Configuracao sugerida:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Runtime: Node

Env vars obrigatorias do backend:

- `NODE_ENV=production`
- `DATABASE_URL` (do Postgres do Render)
- `CORS_ORIGIN` (URL publica do frontend no Render)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (ex.: `gemini-2.5-flash`)

### Banco Postgres (Render)

Crie um banco PostgreSQL no Render e conecte no backend via `DATABASE_URL`.

Depois rode:

- `npm run db:migrate`
- `npm run db:seed:all` (se houver seeders)

### Frontend (Static Site)

Crie um Static Site no Render.

Configuracao sugerida:

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

Env var obrigatoria do frontend:

- `VITE_API_URL=https://SEU_BACKEND.onrender.com/api`

### Checklist de deploy

- `GET /api/health` do backend respondendo
- frontend autenticando corretamente
- CORS liberado apenas para o dominio do frontend
- migrations aplicadas no banco de producao
- segredos JWT e Gemini configurados
