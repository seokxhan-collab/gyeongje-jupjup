-- 경제줍줍 스키마
-- 원문 전체는 절대 저장하지 않는다: title, RSS가 제공하는 짧은 summary, link만 저장한다.

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_country text not null check (source_country in ('domestic', 'international')),
  category text not null default 'general'
    check (category in ('markets', 'real_estate', 'industry', 'policy', 'crypto', 'general')),
  title text not null,
  summary text,
  link text not null unique,
  published_at timestamptz not null,
  fetched_at timestamptz not null default now()
);

create index if not exists news_published_at_idx on news (published_at desc);
create index if not exists news_source_country_idx on news (source_country);
create index if not exists news_source_idx on news (source);
create index if not exists news_category_idx on news (category);

create table if not exists briefings (
  id uuid primary key default gen_random_uuid(),
  briefing_date date not null unique,
  items jsonb not null,
  model text not null,
  created_at timestamptz not null default now()
);

alter table news enable row level security;
alter table briefings enable row level security;

-- 프론트엔드(anon)는 읽기만 가능. 쓰기는 service role(Edge Functions)만 수행.
drop policy if exists "public read news" on news;
create policy "public read news" on news
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read briefings" on briefings;
create policy "public read briefings" on briefings
  for select
  to anon, authenticated
  using (true);
