-- Harden function search_path for the function created in this migration
create or replace function public.update_orcamentos_updated_at()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  new.updated_at = now();
  return new;
end $$;