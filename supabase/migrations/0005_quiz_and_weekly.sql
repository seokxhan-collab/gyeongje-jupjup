-- 경제줍줍: 오늘의 퀴즈 / 주간 시황 총평 (자체 콘텐츠 확장)
-- 실행 전에 두 곳을 프로젝트 값으로 바꿀 것 (0002_cron.sql과 동일):
--   1. uhidbykzodpvqktsbxgp → 프로젝트 참조 ID
--   2. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... → 프로젝트 anon public key

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  quiz_date date not null unique,
  questions jsonb not null,
  model text not null,
  created_at timestamptz not null default now()
);

create table if not exists weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique,
  title text not null,
  paragraphs jsonb not null,
  model text not null,
  created_at timestamptz not null default now()
);

alter table quizzes enable row level security;
alter table weekly_reviews enable row level security;

drop policy if exists "public read quizzes" on quizzes;
create policy "public read quizzes" on quizzes
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public read weekly_reviews" on weekly_reviews;
create policy "public read weekly_reviews" on weekly_reviews
  for select
  to anon, authenticated
  using (true);

-- 매일 한국시간(KST) 오전 7시 10분 = UTC 22시 10분(전날)에 오늘의 퀴즈 생성
-- (generate-briefing 07:00 KST 직후)
select cron.schedule(
  'generate-quiz-daily',
  '10 22 * * *',
  $$
  select net.http_post(
    url := 'https://uhidbykzodpvqktsbxgp.supabase.co/functions/v1/generate-quiz',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaWRieWt6b2RwdnFrdHNieGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTE2NjQsImV4cCI6MjEwMTE2NzY2NH0.xdnHlFWvt7AZcuNK6HQt5bMzDFceIjCRqrScN3KfTig',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 매주 월요일 한국시간(KST) 오전 7시 15분 = UTC 일요일 22시 15분에 주간 시황 총평 생성
select cron.schedule(
  'generate-weekly-review-monday',
  '15 22 * * 0',
  $$
  select net.http_post(
    url := 'https://uhidbykzodpvqktsbxgp.supabase.co/functions/v1/generate-weekly-review',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaWRieWt6b2RwdnFrdHNieGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTE2NjQsImV4cCI6MjEwMTE2NzY2NH0.xdnHlFWvt7AZcuNK6HQt5bMzDFceIjCRqrScN3KfTig',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 등록된 크론 확인
-- select * from cron.job;

-- 특정 크론 삭제가 필요할 때
-- select cron.unschedule('generate-quiz-daily');
-- select cron.unschedule('generate-weekly-review-monday');
