-- 경제줍줍: 경제 용어사전 기능 재활성화
-- 0032에서 해제했던 크론을 원래 스케줄(매일 KST 오전 7시 20분)로 다시 등록한다.

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
