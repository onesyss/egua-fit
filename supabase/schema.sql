-- Rode no SQL Editor do Supabase (uma vez).
-- Cada personal só vê e edita os próprios alunos. Assim o cadastro
-- feito no notebook aparece no celular (e vice-versa) com a mesma conta.

create table if not exists public.students (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default '',
  email text,
  phone text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.students
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.students
  alter column user_id set default auth.uid();

alter table public.students enable row level security;

drop policy if exists "egua_fit_students_all" on public.students;
drop policy if exists "students_select_own" on public.students;
drop policy if exists "students_insert_own" on public.students;
drop policy if exists "students_update_own" on public.students;
drop policy if exists "students_delete_own" on public.students;

create policy "students_select_own"
  on public.students for select to authenticated
  using (auth.uid() = user_id);

create policy "students_insert_own"
  on public.students for insert to authenticated
  with check (auth.uid() = user_id);

create policy "students_update_own"
  on public.students for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "students_delete_own"
  on public.students for delete to authenticated
  using (auth.uid() = user_id);

revoke all on public.students from anon;
grant select, insert, update, delete on public.students to authenticated;

-- Permite o personal excluir a própria conta pelo app.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  delete from public.students
  where payload->>'ownerId' = uid::text;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- Se já existiam alunos sem dono, atribua ao seu usuário
-- (Authentication → Users → copie o UUID):
-- update public.students set user_id = 'COLE-O-UUID-AQUI' where user_id is null;
