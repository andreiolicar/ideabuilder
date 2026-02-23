# TCC Idea Builder

TCC Idea Builder e um SaaS para apoiar estudantes na criacao, estruturacao e organizacao de ideias para TCC (Trabalho de Conclusao de Curso), com geracao automatica de documentacoes usando IA.

## Visao Geral

O projeto resolve a etapa mais critica do TCC: sair de ideias soltas para um plano claro, documentado e executavel.

Com base em um formulario guiado, o sistema gera:
- Documento Geral
- Especificacoes Tecnicas
- Roadmap de Desenvolvimento (2 anos)

Cada geracao consome 1 credito do usuario, com rastreabilidade completa em ledger.

## Problema que o Produto Resolve

Em cursos tecnicos e tecnologos, e comum encontrar:
- dificuldade para definir tema e escopo
- ideias desconectadas e sem padrao
- retrabalho na formalizacao da proposta
- baixa previsibilidade de custo e execucao

O TCC Idea Builder padroniza esse processo e reduz o tempo de estruturacao inicial.

## Funcionalidades Principais

### Usuario
- cadastro, login, refresh e logout com JWT
- criacao de projeto por formulario
- geracao de 3 documentos em Markdown via IA
- organizacao de projetos em cards
- busca, filtros e ordenacao de projetos
- visualizacao por abas (Geral, Tech, Roadmap)
- exportacao de PDF por documento, por projeto completo e em lote
- pagina de perfil (dados pessoais e seguranca)
- pagina de configuracoes (preferencias persistidas)

### Administracao
- painel de usuarios
- ajuste de creditos (credito/debito)
- consulta de ledger de creditos com paginacao

## Regras de Negocio Criticas

- cada geracao consome exatamente 1 credito
- sem credito disponivel, geracao e bloqueada
- todo ajuste ou consumo de credito gera registro em `credit_ledger`
- idempotencia obrigatoria em geracao via `Idempotency-Key`
- usuario acessa apenas projetos proprios (ownership)
- rotas administrativas exigem role `ADMIN`

## Arquitetura

### Backend
- Node.js + Express
- PostgreSQL + Sequelize
- JWT (access + refresh) e bcrypt
- Zod para validacao
- servicos modulares (auth, projects, credits, admin, users/profile/settings, email)

### Frontend
- React + Vite
- Tailwind CSS
- React Router
- Axios com interceptor de refresh token
- layout com sidebar fixa e design system proprio

### Email
- fila persistida em banco (`email_queue`)
- worker assincro no backend
- envio por API (Resend)
- templates HTML e texto, consistentes com a identidade visual do sistema

## Estrutura do Repositorio

- `backend/` API, regras de negocio, models, migrations e servicos
- `frontend/` aplicacao web (UI/UX, rotas, componentes e integracoes)
- `docs/` especificacoes, playbook e artefatos de arquitetura/produto

## Modelos de Dados (Core)

- `users`
- `refresh_tokens`
- `projects`
- `documents`
- `credit_ledger`
- `user_settings`
- `auth_verification_codes`
- `email_queue`

## Fluxos de Destaque

### Geracao de Projeto
1. usuario envia formulario + `Idempotency-Key`
2. sistema valida saldo
3. cria projeto em `GENERATING` e debita 1 credito
4. gera documentos via IA
5. salva documentos, atualiza status para `READY`
6. em falha, marca `FAILED` e aplica `REFUND`

### Seguranca de Conta
- refresh token com rotacao
- revogacao de sessoes
- redefinicao de senha com OTP por email
- alteracoes sensiveis podem forcar novo login

## API (Resumo de Dominios)

- `Auth`: registro, login, refresh, logout, recuperacao de senha
- `Projects`: listagem, detalhes, edicao, geracao, exclusao, exportacao PDF
- `Admin`: usuarios, ajuste de creditos, ledger
- `Users`: perfil, configuracoes e fluxos de seguranca

## UI/UX

O frontend segue uma linha minimalista e premium:
- hierarquia tipografica clara
- alto contraste para legibilidade
- componentes reutilizaveis
- feedbacks consistentes com toasts e estados de carregamento
- layouts de dashboard com sidebar fixa e area principal responsiva

## Status do Projeto

MVP funcional em evolucao continua, com foco em:
- robustez dos fluxos de geracao
- qualidade das documentacoes
- exportacao e apresentacao profissional dos artefatos
- experiencia de uso para estudante e administracao

## Roadmap de Evolucao

- melhoria continua dos prompts e qualidade dos documentos
- templates por dominio academico (Saude, Educacao, Industria etc.)
- colaboracao entre usuarios
- historico de versoes por projeto
- recursos avancados de apresentacao e exportacao

## Fonte de Verdade

Para regras detalhadas e contratos oficiais do produto, consulte:
- `docs/SPEC.md`
- `docs/codex-playbook.md`
