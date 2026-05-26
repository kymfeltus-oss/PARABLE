-- My Sanctuary feed filters by posts.category = 'sanctuary'.
-- Run in Supabase SQL editor if the column is missing.

alter table public.posts add column if not exists category text;

create index if not exists posts_category_idx on public.posts (category);

comment on column public.posts.category is 'Optional feed bucket (e.g. sanctuary for My Sanctuary).';
