-- 경제줍줍: 커뮤니티 상단 고정(공지) 글
-- 일반 회원은 pinned=true로 글을 쓰거나 수정할 수 없다 (운영자가 마이그레이션으로만 지정).
-- 고정된 글은 DB 트리거로 삭제 자체를 막아, 실수로든 의도적으로든 삭제할 수 없게 한다.

alter table community_posts
  add column if not exists pinned boolean not null default false;

create index if not exists community_posts_pinned_idx on community_posts (pinned, created_at desc);

drop policy if exists "user insert own post" on community_posts;
create policy "user insert own post" on community_posts
  for insert
  to authenticated
  with check (auth.uid() = user_id and pinned = false);

drop policy if exists "user update own post" on community_posts;
create policy "user update own post" on community_posts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and pinned = false);

create or replace function public.prevent_pinned_post_deletion()
returns trigger
language plpgsql
as $$
begin
  if old.pinned then
    raise exception '고정된 글은 삭제할 수 없습니다.';
  end if;
  return old;
end;
$$;

drop trigger if exists prevent_pinned_community_post_deletion on community_posts;
create trigger prevent_pinned_community_post_deletion
  before delete on community_posts
  for each row execute function public.prevent_pinned_post_deletion();
