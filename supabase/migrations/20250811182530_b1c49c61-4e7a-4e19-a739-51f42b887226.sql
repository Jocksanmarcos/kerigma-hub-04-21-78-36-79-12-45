-- Create public bucket for event cover images
insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

-- Allow public read access to event cover images
create policy if not exists "Public can view event cover images"
on storage.objects for select
using (bucket_id = 'event-covers');

-- Allow authenticated users to upload to their own folder (userId/filename)
create policy if not exists "Users can upload event cover images to their own folder"
on storage.objects for insert
with check (
  bucket_id = 'event-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own images
create policy if not exists "Users can update their own event cover images"
on storage.objects for update
using (
  bucket_id = 'event-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
create policy if not exists "Users can delete their own event cover images"
on storage.objects for delete
using (
  bucket_id = 'event-covers'
  and auth.uid()::text = (storage.foldername(name))[1]
);