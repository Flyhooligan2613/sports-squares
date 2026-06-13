-- Ensure announcement storage bucket accepts optimized WebP uploads

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'platform-announcements',
  'platform-announcements',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "platform_announcements_storage_public_read" on storage.objects;
create policy "platform_announcements_storage_public_read" on storage.objects
  for select using (bucket_id = 'platform-announcements');

drop policy if exists "platform_announcements_storage_service" on storage.objects;
create policy "platform_announcements_storage_service" on storage.objects
  for all using (bucket_id = 'platform-announcements') with check (bucket_id = 'platform-announcements');
