-- 경제줍줍: 뉴스 좋아요/싫어요 반응
-- 로그인한 사용자만 반응을 남길 수 있다 (스팸 방지를 위해 익명 반응은 허용하지 않음).

create table if not exists news_reactions (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references news(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (news_id, user_id)
);

create index if not exists news_reactions_news_id_idx on news_reactions (news_id);

alter table news_reactions enable row level security;

drop policy if exists "public read news_reactions" on news_reactions;
create policy "public read news_reactions" on news_reactions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "user insert own reaction" on news_reactions;
create policy "user insert own reaction" on news_reactions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user update own reaction" on news_reactions;
create policy "user update own reaction" on news_reactions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user delete own reaction" on news_reactions;
create policy "user delete own reaction" on news_reactions
  for delete
  to authenticated
  using (auth.uid() = user_id);
