-- 경제줍줍: 오늘의 퀴즈 점수 기록 + 순위표
-- 채점은 반드시 서버(Edge Function, service role)에서만 수행한다.
-- anon/authenticated에게는 select 정책만 부여하고 insert/update 정책은 만들지 않으므로,
-- 클라이언트가 REST API로 직접 점수를 조작해 넣는 것이 원천적으로 불가능하다.

create table if not exists quiz_scores (
  id uuid primary key default gen_random_uuid(),
  quiz_date date not null,
  client_id text not null,
  nickname text,
  score integer not null,
  total integer not null,
  created_at timestamptz not null default now(),
  unique (quiz_date, client_id),
  check (total > 0),
  check (score >= 0 and score <= total),
  check (char_length(coalesce(nickname, '')) <= 20)
);

create index if not exists quiz_scores_quiz_date_score_idx on quiz_scores (quiz_date, score desc, created_at asc);

alter table quiz_scores enable row level security;

drop policy if exists "public read quiz_scores" on quiz_scores;
create policy "public read quiz_scores" on quiz_scores
  for select
  to anon, authenticated
  using (true);

-- 실시간 순위표 반영을 위해 Realtime publication에 추가
alter publication supabase_realtime add table quiz_scores;
