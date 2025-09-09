-- Create user_permissions table for per-user overrides
create table if not exists public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  granted boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid
);

alter table public.user_permissions enable row level security;

-- Recreate policies idempotently
drop policy if exists "Admins can manage user permissions" on public.user_permissions;
create policy "Admins can manage user permissions"
  on public.user_permissions
  as permissive
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

drop policy if exists "Users can view own user permissions" on public.user_permissions;
create policy "Users can view own user permissions"
  on public.user_permissions
  as permissive
  for select
  to authenticated
  using (user_id = auth.uid());

-- Create abac_rules table to store conditional (ABAC) rules
create table if not exists public.abac_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  action text not null,
  subject text not null,
  resource_type text,
  condition jsonb default '{}'::jsonb,
  active boolean not null default true,
  scope text not null default 'global', -- 'global' | 'profile' | 'user'
  profile_id uuid references public.profiles(id) on delete cascade,
  user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.abac_rules enable row level security;

-- Trigger to update updated_at
create or replace function public.update_updated_at_abac()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_abac_rules_updated on public.abac_rules;
create trigger trg_abac_rules_updated
before update on public.abac_rules
for each row execute function public.update_updated_at_abac();

-- RLS: Admins can manage ABAC rules
drop policy if exists "Admins can manage ABAC rules" on public.abac_rules;
create policy "Admins can manage ABAC rules"
  on public.abac_rules
  as permissive
  for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- RLS: Everyone can read active ABAC rules (optional, read-only usage)
drop policy if exists "Read active ABAC rules" on public.abac_rules;
create policy "Read active ABAC rules"
  on public.abac_rules
  as permissive
  for select
  to authenticated
  using (active = true);

-- Helper: evaluate simple ABAC condition JSON
-- Supports fields like {"time_restriction":"08:00-18:00"}
create or replace function public.evaluate_abac_condition(cond jsonb)
returns boolean
language plpgsql
stable
security definer
as $$
declare
  time_window text;
  start_t text;
  end_t text;
  now_time time;
begin
  if cond is null or cond = '{}'::jsonb then
    return true;
  end if;

  -- Time restriction check
  time_window := cond->> 'time_restriction';
  if time_window is not null and position('-' in time_window) > 0 then
    start_t := split_part(time_window, '-', 1);
    end_t := split_part(time_window, '-', 2);
    now_time := (now() at time zone 'America/Sao_Paulo')::time;
    if now_time < start_t::time or now_time > end_t::time then
      return false;
    end if;
  end if;

  return true;
end;
$$;

-- Update the no-arg user_has_permission function to include user overrides and ABAC rules
create or replace function public.user_has_permission(action_name text, subject_name text, resource_type_param text default null)
returns boolean
language plpgsql
stable
security definer
set search_path = 'public'
as $$
begin
  -- First, RBAC via profile permissions
  if exists (
    select 1
    from pessoas pe
    join profile_permissions pp on pe.profile_id = pp.profile_id
    join permissions p on pp.permission_id = p.id
    where pe.user_id = auth.uid()
      and pp.granted = true
      and p.action = action_name
      and p.subject = subject_name
      and (resource_type_param is null or p.resource_type = resource_type_param)
  ) then
    return true;
  end if;

  -- Then, per-user overrides
  if exists (
    select 1
    from user_permissions up
    join permissions p on up.permission_id = p.id
    where up.user_id = auth.uid()
      and up.granted = true
      and p.action = action_name
      and p.subject = subject_name
      and (resource_type_param is null or p.resource_type = resource_type_param)
  ) then
    return true;
  end if;

  -- Finally, ABAC rules (global/profile/user) with simple condition evaluation
  if exists (
    select 1
    from abac_rules ar
    left join pessoas pe on pe.user_id = auth.uid()
    where ar.active = true
      and ar.action = action_name
      and ar.subject = subject_name
      and (ar.resource_type is null or ar.resource_type = resource_type_param)
      and (
        ar.scope = 'global' or
        (ar.scope = 'profile' and ar.profile_id is not null and pe.profile_id = ar.profile_id) or
        (ar.scope = 'user' and ar.user_id = auth.uid())
      )
      and evaluate_abac_condition(ar.condition) = true
  ) then
    return true;
  end if;

  return false;
end;
$$;