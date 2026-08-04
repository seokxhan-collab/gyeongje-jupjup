-- 경제줍줍: 오늘의 경제 용어사전 (자체 콘텐츠 확장)
-- 실행 전에 두 곳을 프로젝트 값으로 바꿀 것 (0002_cron.sql과 동일):
--   1. uhidbykzodpvqktsbxgp → 프로젝트 참조 ID
--   2. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... → 프로젝트 anon public key

create table if not exists glossary_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  definition text not null,
  example text,
  model text not null,
  created_at timestamptz not null default now()
);

create index if not exists glossary_terms_created_at_idx on glossary_terms (created_at desc);

alter table glossary_terms enable row level security;

drop policy if exists "public read glossary_terms" on glossary_terms;
create policy "public read glossary_terms" on glossary_terms
  for select
  to anon, authenticated
  using (true);

-- 매일 한국시간(KST) 오전 7시 20분 = UTC 22시 20분(전날)에 오늘의 경제 용어 1개 추가
-- (generate-quiz 07:10 KST 직후)
select cron.schedule(
  'generate-glossary-term-daily',
  '20 22 * * *',
  $$
  select net.http_post(
    url := 'https://uhidbykzodpvqktsbxgp.supabase.co/functions/v1/generate-glossary-term',
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
-- select cron.unschedule('generate-glossary-term-daily');
