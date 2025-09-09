-- Fix: recreate policies without IF NOT EXISTS
-- Bucket for financial receipts
insert into storage.buckets (id, name, public)
values ('financeiro-comprovantes', 'financeiro-comprovantes', false)
on conflict (id) do nothing;

-- Table for receipts (comprovantes)
create table if not exists public.comprovantes_financeiros (
  id uuid primary key default gen_random_uuid(),
  lancamento_id uuid not null,
  file_path text not null,
  file_url text,
  uploaded_at timestamptz not null default now()
);

-- FK to lancamentos_financeiros_v2 if present
do $$ begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema='public' and table_name='lancamentos_financeiros_v2'
  ) then
    begin
      alter table public.comprovantes_financeiros
        add constraint comprovantes_financeiros_lanc_fkey
        foreign key (lancamento_id) references public.lancamentos_financeiros_v2(id)
        on delete cascade;
    exception when duplicate_object then null; end;
  end if;
end $$;

alter table public.comprovantes_financeiros enable row level security;

-- Recreate comprovantes policies
drop policy if exists "Manage comprovantes (finance admin)" on public.comprovantes_financeiros;
create policy "Manage comprovantes (finance admin)"
  on public.comprovantes_financeiros for all
  using (is_admin() or user_has_permission('manage','financeiro'))
  with check (is_admin() or user_has_permission('manage','financeiro'));

drop policy if exists "Read comprovantes (finance readers)" on public.comprovantes_financeiros;
create policy "Read comprovantes (finance readers)"
  on public.comprovantes_financeiros for select
  using (is_admin() or user_has_permission('read','financeiro') or user_has_permission('manage','financeiro'));

-- Storage policies for the bucket
drop policy if exists "Finance comprovantes select" on storage.objects;
create policy "Finance comprovantes select"
  on storage.objects for select
  using (bucket_id = 'financeiro-comprovantes' and (is_admin() or user_has_permission('read','financeiro') or user_has_permission('manage','financeiro')));

drop policy if exists "Finance comprovantes insert" on storage.objects;
create policy "Finance comprovantes insert"
  on storage.objects for insert
  with check (bucket_id = 'financeiro-comprovantes' and (is_admin() or user_has_permission('manage','financeiro')));

drop policy if exists "Finance comprovantes update" on storage.objects;
create policy "Finance comprovantes update"
  on storage.objects for update
  using (bucket_id = 'financeiro-comprovantes' and (is_admin() or user_has_permission('manage','financeiro')))
  with check (bucket_id = 'financeiro-comprovantes' and (is_admin() or user_has_permission('manage','financeiro')));

drop policy if exists "Finance comprovantes delete" on storage.objects;
create policy "Finance comprovantes delete"
  on storage.objects for delete
  using (bucket_id = 'financeiro-comprovantes' and (is_admin() or user_has_permission('manage','financeiro')));

-- Budget tables
create table if not exists public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  ano integer not null,
  mes integer not null check (mes between 1 and 12),
  igreja_id uuid,
  nome text,
  status text not null default 'ativo',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uniq_orcamentos_periodo on public.orcamentos(ano, mes, igreja_id);

create table if not exists public.orcamento_itens (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos(id) on delete cascade,
  categoria_id uuid not null references public.categorias_financeiras(id),
  meta_valor numeric not null default 0
);

create unique index if not exists uniq_orcamento_item on public.orcamento_itens(orcamento_id, categoria_id);

alter table public.orcamentos enable row level security;
alter table public.orcamento_itens enable row level security;

-- Policies for orcamentos
drop policy if exists "Manage orcamentos (finance admin)" on public.orcamentos;
create policy "Manage orcamentos (finance admin)"
  on public.orcamentos for all
  using (is_admin() or user_has_permission('manage','financeiro'))
  with check (is_admin() or user_has_permission('manage','financeiro'));

drop policy if exists "Read orcamentos (finance readers)" on public.orcamentos;
create policy "Read orcamentos (finance readers)"
  on public.orcamentos for select
  using (is_admin() or user_has_permission('read','financeiro') or user_has_permission('manage','financeiro'));

-- Policies for orcamento_itens
drop policy if exists "Manage orcamento_itens (finance admin)" on public.orcamento_itens;
create policy "Manage orcamento_itens (finance admin)"
  on public.orcamento_itens for all
  using (is_admin() or user_has_permission('manage','financeiro'))
  with check (is_admin() or user_has_permission('manage','financeiro'));

drop policy if exists "Read orcamento_itens (finance readers)" on public.orcamento_itens;
create policy "Read orcamento_itens (finance readers)"
  on public.orcamento_itens for select
  using (is_admin() or user_has_permission('read','financeiro') or user_has_permission('manage','financeiro'));

-- Trigger to keep updated_at
create or replace function public.update_orcamentos_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_update_orcamentos_updated_at on public.orcamentos;
create trigger trg_update_orcamentos_updated_at
before update on public.orcamentos
for each row execute function public.update_orcamentos_updated_at();