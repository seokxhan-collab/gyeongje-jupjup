-- 경제줍줍: 오늘의 브리핑 구독 (텔레그램/이메일)
-- 개인정보(연락처)가 담긴 테이블이라 anon/authenticated에게 어떤 정책도 주지 않는다.
-- 모든 읽기/쓰기는 반드시 Edge Function(service role)을 통해서만 이뤄진다.

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'telegram')),
  destination text, -- email: 이메일 주소, telegram: chat_id (활성화 전에는 null)
  status text not null default 'pending' check (status in ('pending', 'active', 'unsubscribed')),
  token text not null, -- 이메일 인증/해지 링크, 텔레그램 /start 딥링크에 쓰는 무작위 토큰
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unique (token)
);

create unique index if not exists subscribers_active_destination_idx
  on subscribers (channel, destination)
  where status = 'active';

create index if not exists subscribers_channel_status_idx on subscribers (channel, status);

alter table subscribers enable row level security;
-- 의도적으로 정책을 하나도 만들지 않는다: anon/authenticated는 select/insert/update/delete 전부 불가.

-- 매일 한국시간(KST) 오전 7시 6분 = UTC 22시 6분(전날)에 활성 텔레그램 구독자에게 브리핑 발송
-- (generate-briefing 07:00 KST, send-briefing-telegram 07:05 KST 직후)
select cron.schedule(
  'send-daily-briefing-subscribers',
  '6 22 * * *',
  $$
  select net.http_post(
    url := 'https://uhidbykzodpvqktsbxgp.supabase.co/functions/v1/send-daily-briefing-subscribers',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaWRieWt6b2RwdnFrdHNieGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTE2NjQsImV4cCI6MjEwMTE2NzY2NH0.xdnHlFWvt7AZcuNK6HQt5bMzDFceIjCRqrScN3KfTig',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
