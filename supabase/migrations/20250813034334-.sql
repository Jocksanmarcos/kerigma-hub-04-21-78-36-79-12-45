-- Patch existing orcamentos table to ensure required columns exist
alter table public.orcamentos add column if not exists igreja_id uuid;
alter table public.orcamentos add column if not exists nome text;
alter table public.orcamentos add column if not exists status text not null default 'ativo';
alter table public.orcamentos add column if not exists created_by uuid default auth.uid();
alter table public.orcamentos add column if not exists created_at timestamptz not null default now();
alter table public.orcamentos add column if not exists updated_at timestamptz not null default now();

-- Now (re)create the unique index safely
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname='public' and indexname='uniq_orcamentos_periodo'
  ) then
    create unique index uniq_orcamentos_periodo on public.orcamentos(ano, mes, igreja_id);
  end if;
end $$;