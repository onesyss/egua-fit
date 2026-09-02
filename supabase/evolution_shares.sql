-- Compartilhamento público da evolução mensal (link no WhatsApp/e-mail).
-- Rode no SQL Editor do Supabase se a tabela ainda não existir.

create table if not exists public.evolution_shares (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  student_id text not null,
  student_name text not null default '',
  year int not null,
  month int not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists evolution_shares_user_id_idx
  on public.evolution_shares (user_id);

create index if not exists evolution_shares_student_month_idx
  on public.evolution_shares (student_id, year, month);

alter table public.evolution_shares enable row level security;

drop policy if exists "evolution_shares_insert_own" on public.evolution_shares;
drop policy if exists "evolution_shares_select_public" on public.evolution_shares;
drop policy if exists "evolution_shares_delete_own" on public.evolution_shares;

create policy "evolution_shares_insert_own"
  on public.evolution_shares for insert to authenticated
  with check (auth.uid() = user_id);

-- Quem tem o link (token no id) pode abrir sem login
create policy "evolution_shares_select_public"
  on public.evolution_shares for select to anon, authenticated
  using (true);

create policy "evolution_shares_delete_own"
  on public.evolution_shares for delete to authenticated
  using (auth.uid() = user_id);

revoke all on public.evolution_shares from public;
grant select on public.evolution_shares to anon;
grant select, insert, delete on public.evolution_shares to authenticated;
