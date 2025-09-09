-- Create public bucket for event cover images (idempotent)
insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

-- Recreate policies idempotently
DROP POLICY IF EXISTS "Public can view event cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload event cover images to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event cover images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event cover images" ON storage.objects;

-- Allow public read access to event cover images
create policy "Public can view event cover images"
on storage.objects for select
using (bucket_id = 'event-covers');

-- Allow authenticated users to upload to their own folder (userId/filename)
create policy "Users can upload event cover images to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'event-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own images
create policy "Users can update their own event cover images"
on storage.objects for update
using (
  bucket_id = 'event-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
create policy "Users can delete their own event cover images"
on storage.objects for delete
using (
  bucket_id = 'event-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);