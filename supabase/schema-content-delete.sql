-- Hard-delete RLS for PARABLE posts and comments.
-- Run once in Supabase SQL Editor after `posts` and `post_comments` exist.
-- Reels/stories delete policies live in schema-reels.sql and schema-stories.sql.

alter table public.posts enable row level security;

drop policy if exists "Users delete own posts" on public.posts;
create policy "Users delete own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = profile_id);

drop policy if exists "Users delete own post_comments" on public.post_comments;
drop policy if exists "Users delete own or post-owner post_comments" on public.post_comments;
create policy "Users delete own or post-owner post_comments"
  on public.post_comments for delete
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.posts p
      where p.id = post_comments.post_id
        and p.profile_id = auth.uid()
    )
  );

notify pgrst, 'reload schema';
