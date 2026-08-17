# Égua Fit

Painel interno para personal trainer: cadastro de alunos, montagem de treino e dashboard de desempenho.

## Telas

- **Alunos** (`/`) — lista e cadastro dos alunos
- **Dashboard** (`/aluno/:id`) — desempenho, volume em kg, PRs e histórico
- **Montar treino** (`/aluno/:id/treino`) — programação, cronômetro e registro da sessão
- **Evolução física** (`/aluno/:id/evolucao`) — cardio / core
- **Protocolo** (`/aluno/:id/protocolo`) — anamnese, testes/avaliação e prescrição
- **Relatório** (`/aluno/:id/relatorio`) — relatório personalizado para impressão
- **Dupla** (`/dupla`) — atendimento simultâneo de dois alunos

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5173/ — se já estiver logado, use **Sair** no topo para ver o login.

## Produção

Site no ar: **https://egua-fit.netlify.app/**

O Netlify publica a cada push na `main`. Em **Site configuration → Environment variables**, defina:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

(os mesmos do `.env.local`). Sem isso o login abre, mas não conecta no banco.

Rotas como `/login` e `/perfil` precisam do redirect da SPA (já está no `netlify.toml`).

## Supabase

Este projeto é Vite (não Next). As variáveis no `.env.local` são:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

No SQL Editor do Supabase, rode o arquivo `supabase/schema.sql` para criar a tabela e isolar os alunos por personal.

## Stack

React + TypeScript (Vite) · Tailwind CSS v4 · Recharts · React Router · Supabase
