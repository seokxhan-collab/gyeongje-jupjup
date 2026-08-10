-- 경제줍줍: 관리자는 고정(공지) 글에 대해서도 완전한 권한을 가진다.
-- 0029의 "pinned 글은 삭제 불가" 트리거는 일반 회원에게는 그대로 적용하되,
-- 관리자(is_admin)는 예외로 삭제까지 가능하게 한다. (수정은 0035의 admin update 정책으로 이미 가능)

create or replace function public.prevent_pinned_post_deletion()
returns trigger
language plpgsql
as $$
begin
  if old.pinned and not public.current_user_is_admin() then
    raise exception '고정된 글은 삭제할 수 없습니다.';
  end if;
  return old;
end;
$$;
