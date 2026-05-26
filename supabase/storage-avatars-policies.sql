-- Run in Supabase SQL Editor after creating the public bucket named `avatars`.
-- Without these policies, client uploads from the app will fail with Storage permission errors.

drop policy if exists "Public read avatars bucket" on storage.objects;
drop policy if exists "Users upload avatar to own folder" on storage.objects;
drop policy if exists "Users update own avatar object" on storage.objects;
drop policy if exists "Users delete own avatar object" on storage.objects;

create policy "Public read avatars bucket"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users upload avatar to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users update own avatar object"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users delete own avatar object"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );
