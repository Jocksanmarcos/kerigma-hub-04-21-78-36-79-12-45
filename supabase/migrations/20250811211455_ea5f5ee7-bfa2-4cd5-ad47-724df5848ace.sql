-- Update functions to set search_path for linter compliance
create or replace function public.update_updated_at_abac()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.evaluate_abac_condition(cond jsonb)
returns boolean
language plpgsql
stable
security definer
set search_path = 'public'
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