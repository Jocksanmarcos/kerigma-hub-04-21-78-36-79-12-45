-- Create table to store Google OAuth tokens per user
create table if not exists public.google_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  access_token text not null,
  refresh_token text,
  scope text,
  token_type text,
  expiry_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint google_oauth_tokens_user_unique unique (user_id)
);

-- Enable RLS and policies
alter table public.google_oauth_tokens enable row level security;

create policy "Users can manage own google tokens"
  on public.google_oauth_tokens
  as permissive
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Trigger to auto-update updated_at
create trigger update_google_oauth_tokens_updated_at
before update on public.google_oauth_tokens
for each row execute function public.update_updated_at();

-- Add an index to speed up lookups by user
create index if not exists idx_google_oauth_tokens_user on public.google_oauth_tokens(user_id);

-- Improve visibility of agendamentos for participants
-- Add an extra SELECT policy allowing participants to view their events
create policy "Participants can view their agendamentos"
  on public.agendamentos
  for select
  using (
    exists (
      select 1 from public.agendamento_participantes ap
      where ap.agendamento_id = agendamentos.id
        and ap.pessoa_id = public.get_current_person_id()
    )
  );

-- Ensure patrimonio_reservas has proper RLS and conflict validation
alter table public.patrimonio_reservas enable row level security;

create policy "Users can view own reservas or admins"
  on public.patrimonio_reservas
  for select
  using (solicitante_id = public.get_current_person_id() or public.is_admin());

create policy "Users can create own reservas"
  on public.patrimonio_reservas
  for insert
  with check (solicitante_id = public.get_current_person_id());

create policy "Users can update own reservas or admins"
  on public.patrimonio_reservas
  for update
  using (solicitante_id = public.get_current_person_id() or public.is_admin())
  with check (solicitante_id = public.get_current_person_id() or public.is_admin());

create policy "Users can delete own reservas or admins"
  on public.patrimonio_reservas
  for delete
  using (solicitante_id = public.get_current_person_id() or public.is_admin());

-- Index for conflict checks
create index if not exists idx_patrimonio_reservas_patrimonio_periodo
  on public.patrimonio_reservas(patrimonio_id, inicio, fim);

-- Trigger function to prevent overlapping reservations for the same asset
create or replace function public.check_patrimonio_reserva_conflito()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  -- Only check for active reservations (not canceled)
  if exists (
    select 1
    from public.patrimonio_reservas pr
    where pr.patrimonio_id = coalesce(new.patrimonio_id, old.patrimonio_id)
      and coalesce(pr.status, 'reservado') <> 'cancelado'
      and pr.id <> coalesce(new.id, old.id)
      and pr.inicio < coalesce(new.fim, old.fim)
      and pr.fim > coalesce(new.inicio, old.inicio)
  ) then
    raise exception 'Já existe uma reserva para este recurso no período selecionado';
  end if;
  return coalesce(new, old);
end;
$$;

-- Attach triggers for INSERT and UPDATE
create trigger patrimonio_reservas_conflict_check_ins
before insert on public.patrimonio_reservas
for each row execute function public.check_patrimonio_reserva_conflito();

create trigger patrimonio_reservas_conflict_check_upd
before update on public.patrimonio_reservas
for each row execute function public.check_patrimonio_reserva_conflito();