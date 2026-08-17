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

## Supabase

Este projeto é Vite (não Next). As variáveis no `.env.local` são:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

No SQL Editor do Supabase, rode o arquivo `supabase/schema.sql` para criar a tabela e isolar os alunos por personal.

## Stack

React + TypeScript (Vite) · Tailwind CSS v4 · Recharts · React Router · Supabase
