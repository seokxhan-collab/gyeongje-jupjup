-- 경제줍줍: 댓글 신고 + 자동 숨김 (경량 모더레이션)
-- 별도 관리자 화면 없이, 신고가 일정 횟수 누적되면 자동으로 숨겨진다.
-- 신고 내역 자체는 subscribers 테이블과 동일하게 완전히 비공개로 관리한다
-- (select 정책을 만들지 않으므로 anon/authenticated 그 누구도 조회 불가,
-- 사이트 운영자만 Supabase 대시보드에서 직접 확인).

alter table news_comments
  add column if not exists report_count integer not null default 0,
  add column if not exists hidden boolean not null default false;

create table if not exists news_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references news_comments(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (comment_id, reporter_id)
);

alter table news_comment_reports enable row level security;

-- 로그인한 사용자는 신고를 접수할 수 있지만, 그 누구도(본인 포함) 신고 내역을 조회할 수 없다.
drop policy if exists "user insert report" on news_comment_reports;
create policy "user insert report" on news_comment_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- 신고 3회 누적 시 해당 댓글을 자동으로 숨긴다.
create or replace function public.handle_new_comment_report()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update news_comments
  set report_count = report_count + 1,
      hidden = (report_count + 1 >= 3)
  where id = new.comment_id;
  return new;
end;
$$;

drop trigger if exists on_comment_report_created on news_comment_reports;
create trigger on_comment_report_created
  after insert on news_comment_reports
  for each row execute function public.handle_new_comment_report();
