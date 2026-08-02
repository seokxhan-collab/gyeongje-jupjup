-- 경제줍줍 크론 설정
-- Supabase 대시보드 > SQL Editor에서 딱 한 번 실행하면 된다.
-- 실행 전에 아래 두 곳을 프로젝트 값으로 바꿀 것:
--   1. uhidbykzodpvqktsbxgp → 프로젝트 참조 ID (예: abcdefghijklmnop)
--   2. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaWRieWt6b2RwdnFrdHNieGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTE2NjQsImV4cCI6MjEwMTE2NzY2NH0.xdnHlFWvt7AZcuNK6HQt5bMzDFceIjCRqrScN3KfTig     → 프로젝트 anon public key (Settings > API)
--
-- Edge Function은 기본적으로 유효한 Supabase JWT(anon key 포함)를 요구하므로
-- anon key를 Authorization 헤더에 실어서 호출한다. anon key는 원래 공개되는 값이라
-- 코드/SQL에 직접 넣어도 보안상 문제 없다 (RLS로 데이터 접근은 이미 제한되어 있음).

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- 30분마다 RSS 수집
select cron.schedule(
  'collect-news-every-30-min',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://uhidbykzodpvqktsbxgp.supabase.co/functions/v1/collect-news',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaWRieWt6b2RwdnFrdHNieGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTE2NjQsImV4cCI6MjEwMTE2NzY2NH0.xdnHlFWvt7AZcuNK6HQt5bMzDFceIjCRqrScN3KfTig',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 매일 한국시간(KST, UTC+9) 오전 7시 = UTC 22시(전날)에 데일리 브리핑 생성
select cron.schedule(
  'generate-briefing-daily',
  '0 22 * * *',
  $$
  select net.http_post(
    url := 'https://uhidbykzodpvqktsbxgp.supabase.co/functions/v1/generate-briefing',
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
-- select cron.unschedule('collect-news-every-30-min');
-- select cron.unschedule('generate-briefing-daily');
