-- 경제줍줍: 뉴스 댓글
-- 로그인한 사용자만 댓글을 남길 수 있다 (스팸 방지를 위해 익명 댓글은 허용하지 않음).

create table if not exists news_comments (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references news(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists news_comments_news_id_idx on news_comments (news_id, created_at asc);

alter table news_comments enable row level security;

drop policy if exists "public read news_comments" on news_comments;
create policy "public read news_comments" on news_comments
  for select
  to anon, authenticated
  using (true);

drop policy if exists "user insert own comment" on news_comments;
create policy "user insert own comment" on news_comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user update own comment" on news_comments;
create policy "user update own comment" on news_comments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user delete own comment" on news_comments;
create policy "user delete own comment" on news_comments
  for delete
  to authenticated
  using (auth.uid() = user_id);
