-- 1) Create Storage bucket for financial receipts (comprovantes)
insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', true)
on conflict (id) do nothing;

-- 2) Storage policies for comprovantes bucket
-- Public read access (since bucket is public); restrict writes to owners' folders
create policy "Public can read comprovantes"
  on storage.objects for select
  using (bucket_id = 'comprovantes');

create policy "Users can upload own comprovantes"
  on storage.objects for insert
  with check (
    bucket_id = 'comprovantes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own comprovantes"
  on storage.objects for update
  using (
    bucket_id = 'comprovantes'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'comprovantes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own comprovantes"
  on storage.objects for delete
  using (
    bucket_id = 'comprovantes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3) Add comprovante_url column to financial entries table
alter table public.lancamentos_financeiros_v2
  add column if not exists comprovante_url text;