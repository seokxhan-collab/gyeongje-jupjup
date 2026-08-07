-- 경제줍줍: 커뮤니티 게시판
-- 카테고리형 자유게시판. 조회는 누구나, 글/댓글 작성은 로그인 회원만 가능하다
-- (news_comments와 동일한 스팸 방지 정책). 신고 3회 누적 시 자동 숨김도 동일하게 적용한다.

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('free', 'question', 'info')),
  title text not null check (char_length(title) between 1 and 100),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  report_count integer not null default 0,
  hidden boolean not null default false
);

create index if not exists community_posts_category_idx on community_posts (category, created_at desc);

alter table community_posts enable row level security;

drop policy if exists "public read community_posts" on community_posts;
create policy "public read community_posts" on community_posts
  for select
  to anon, authenticated
  using (true);

drop policy if exists "user insert own post" on community_posts;
create policy "user insert own post" on community_posts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user update own post" on community_posts;
create policy "user update own post" on community_posts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user delete own post" on community_posts;
create policy "user delete own post" on community_posts
  for delete
  to authenticated
  using (auth.uid() = user_id);

create table if not exists community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  report_count integer not null default 0,
  hidden boolean not null default false
);

create index if not exists community_post_comments_post_id_idx on community_post_comments (post_id, created_at asc);

alter table community_post_comments enable row level security;

drop policy if exists "public read community_post_comments" on community_post_comments;
create policy "public read community_post_comments" on community_post_comments
  for select
  to anon, authenticated
  using (true);

drop policy if exists "user insert own post comment" on community_post_comments;
create policy "user insert own post comment" on community_post_comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user update own post comment" on community_post_comments;
create policy "user update own post comment" on community_post_comments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user delete own post comment" on community_post_comments;
create policy "user delete own post comment" on community_post_comments
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 신고 내역은 news_comment_reports와 동일하게 완전히 비공개 (select 정책 없음)

create table if not exists community_post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);

alter table community_post_reports enable row level security;

drop policy if exists "user insert post report" on community_post_reports;
create policy "user insert post report" on community_post_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create or replace function public.handle_new_community_post_report()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update community_posts
  set report_count = report_count + 1,
      hidden = (report_count + 1 >= 3)
  where id = new.post_id;
  return new;
end;
$$;

drop trigger if exists on_community_post_report_created on community_post_reports;
create trigger on_community_post_report_created
  after insert on community_post_reports
  for each row execute function public.handle_new_community_post_report();

create table if not exists community_post_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references community_post_comments(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, reporter_id)
);

alter table community_post_comment_reports enable row level security;

drop policy if exists "user insert post comment report" on community_post_comment_reports;
create policy "user insert post comment report" on community_post_comment_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create or replace function public.handle_new_community_post_comment_report()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update community_post_comments
  set report_count = report_count + 1,
      hidden = (report_count + 1 >= 3)
  where id = new.comment_id;
  return new;
end;
$$;

drop trigger if exists on_community_post_comment_report_created on community_post_comment_reports;
create trigger on_community_post_comment_report_created
  after insert on community_post_comment_reports
  for each row execute function public.handle_new_community_post_comment_report();
