-- 경제줍줍: 관리자 권한 도입
-- profiles.is_admin 플래그를 만들고, 유일한 기존 계정(psch4042 / 관리자 계정)을 관리자로 지정한다.
-- 관리자는 본인 소유가 아닌 커뮤니티 글/댓글, 뉴스 댓글도 수정·삭제할 수 있고,
-- 신고 내역도 조회할 수 있다 (일반 회원은 절대 불가).
-- 단, 0029에서 만든 "pinned 글은 삭제 자체가 불가능한" 트리거는 관리자에게도 예외 없이 그대로 적용된다
-- (고정 공지는 관리자도 삭제할 수 없다는 게 의도된 동작).

alter table profiles
  add column if not exists is_admin boolean not null default false;

update profiles set is_admin = true where id = '94af41f7-4b5d-4961-878d-e9fd7d98e7e9';

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- ── community_posts ──────────────────────────────────────────────
-- 관리자는 pinned=true로 직접 글을 쓸 수 있고(기존엔 마이그레이션으로만 가능했음),
-- 아무 글이나 수정(숨김 해제 등)·삭제할 수 있다.
drop policy if exists "admin insert any post" on community_posts;
create policy "admin insert any post" on community_posts
  for insert
  to authenticated
  with check (public.current_user_is_admin() and auth.uid() = user_id);

drop policy if exists "admin update any post" on community_posts;
create policy "admin update any post" on community_posts
  for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "admin delete any post" on community_posts;
create policy "admin delete any post" on community_posts
  for delete
  to authenticated
  using (public.current_user_is_admin());

-- ── community_post_comments ──────────────────────────────────────
drop policy if exists "admin update any post comment" on community_post_comments;
create policy "admin update any post comment" on community_post_comments
  for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "admin delete any post comment" on community_post_comments;
create policy "admin delete any post comment" on community_post_comments
  for delete
  to authenticated
  using (public.current_user_is_admin());

-- ── news_comments ─────────────────────────────────────────────────
drop policy if exists "admin update any news comment" on news_comments;
create policy "admin update any news comment" on news_comments
  for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists "admin delete any news comment" on news_comments;
create policy "admin delete any news comment" on news_comments
  for delete
  to authenticated
  using (public.current_user_is_admin());

-- ── 신고 내역 조회 (일반 회원은 본인 포함 그 누구도 조회 불가, 관리자만 예외) ──
drop policy if exists "admin read community post reports" on community_post_reports;
create policy "admin read community post reports" on community_post_reports
  for select
  to authenticated
  using (public.current_user_is_admin());

drop policy if exists "admin read community post comment reports" on community_post_comment_reports;
create policy "admin read community post comment reports" on community_post_comment_reports
  for select
  to authenticated
  using (public.current_user_is_admin());

drop policy if exists "admin read news comment reports" on news_comment_reports;
create policy "admin read news comment reports" on news_comment_reports
  for select
  to authenticated
  using (public.current_user_is_admin());
